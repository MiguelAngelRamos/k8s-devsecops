pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'node-api-rest'
        BRANCH_TAG = "${env.BRANCH_NAME.replace('/', '-')}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Tests & SCA') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-u root:root --entrypoint=""'
                    reuseNode true
                }
            }
            steps {
                script {
                    echo "Instalando dependencias y ejecutando tests..."
                    // npm ci instala las dependencias exactas del package-lock.json (reproducible y limpio)
                    sh 'npm ci'
                    sh 'npm run test:ci'

                    echo "Verificando vulnerabilidades en dependencias (SCA — npm audit)..."
                    // El pipeline SOLO VERIFICA — no modifica package.json ni package-lock.json.
                    // Si hay vulnerabilidades high/critical, el pipeline falla intencionalmente
                    // para que el desarrollador ejecute 'npm audit fix' localmente, commitee
                    // los cambios en package.json y package-lock.json, y haga push al repositorio.
                    // Esto garantiza que el código fuente en el repo siempre refleje
                    // el estado real de las dependencias (principio de infraestructura como código).
                    sh 'npm audit --audit-level=high'
                }
            }
        }

        stage('SAST — SonarQube') {
            steps {
                script {
                    echo "Analizando el código fuente con SonarQube (SAST)..."
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonarqube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Construir y Cargar Imagen en Minikube') {
            steps {
                script {
                    echo "Construyendo la imagen localmente usando Docker del host..."
                    sh "docker build -t ${DOCKER_IMAGE}:${BRANCH_TAG} ."

                    echo "Cargando la imagen al daemon Docker de Minikube..."
                    sh "docker save ${DOCKER_IMAGE}:${BRANCH_TAG} | docker exec -i minikube docker load"
                }
            }
        }

        stage('Container Scanning — Trivy') {
            steps {
                script {
                    echo "Escaneando la imagen Docker en busca de CVEs (Container Scanning)..."
                    sh """
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:0.69.3 image \
                            --exit-code 1 \
                            --severity CRITICAL \
                            --no-progress \
                            ${DOCKER_IMAGE}:${BRANCH_TAG}
                    """
                }
            }
        }

        stage('IaC Scanning — Checkov') {
            steps {
                script {
                    echo "Escaneando manifiestos de Kubernetes en busca de malas configuraciones (IaC)..."
                    sh """
                        docker run --rm \
                            -v ${WORKSPACE}/k8s:/k8s \
                            bridgecrew/checkov \
                            -d /k8s \
                            --framework kubernetes \
                            --quiet \
                            --soft-fail
                    """
                }
            }
        }

        stage('Desplegar en K8s (Minikube)') {
            steps {
                withKubeConfig([credentialsId: 'k8s-token', serverUrl: 'https://192.168.49.2:8443']) {
                    script {
                        def namespace = 'default'
                        if (env.BRANCH_NAME == 'main') {
                            namespace = 'prod'
                        } else if (env.BRANCH_NAME == 'develop') {
                            namespace = 'dev'
                        }

                        sh "kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -"
                        sh "sed -i 's|image: .*|image: ${DOCKER_IMAGE}:${BRANCH_TAG}|g' k8s/api-deployment.yaml"
                        sh "kubectl apply -f k8s/ -n ${namespace}"
                        sh "kubectl rollout restart deployment node-api -n ${namespace}"
                    }
                }
            }
        }
    }
}