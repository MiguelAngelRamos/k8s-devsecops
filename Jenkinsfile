pipeline {
    agent none

    environment {
        DOCKER_IMAGE = 'node-api-rest'
        BRANCH_TAG = "${env.BRANCH_NAME.replace('/', '-')}"
        REGISTRY = '192.168.1.28:5000'
    }

    stages {

        // ─────────────────────────────────────────
        // MASTER: Punto de entrada del pipeline
        // Lee la configuración del repositorio SCM
        // ─────────────────────────────────────────
        stage('Checkout') {
            agent { label 'master' }
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────
        // SLAVE: Tests y análisis de dependencias
        // Node corre dentro de contenedor Docker
        // El slave nunca tiene Node instalado directo
        // ─────────────────────────────────────────
        stage('Tests & SCA') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-u root:root --entrypoint=""'
                    reuseNode true
                    label 'slave'
                }
            }
            steps {
                script {
                    echo "Instalando dependencias y ejecutando tests..."
                    sh 'npm ci'
                    sh 'npm run test:ci'

                    echo "Verificando vulnerabilidades en dependencias (SCA)..."
                    sh 'npm audit --audit-level=high'
                }
            }
        }

        // ─────────────────────────────────────────
        // SLAVE: Build de imagen Docker
        // CPU intensivo — se delega al slave
        // Push al registry local del master
        // ─────────────────────────────────────────
        stage('Build y push a registry') {
            agent { label 'slave' }
            steps {
                script {
                    echo "Construyendo imagen Docker en el slave..."
                    sh "docker build -t ${REGISTRY}/${DOCKER_IMAGE}:${BRANCH_TAG} ."

                    echo "Push al registry local del master..."
                    sh "docker push ${REGISTRY}/${DOCKER_IMAGE}:${BRANCH_TAG}"
                }
            }
        }

        // ─────────────────────────────────────────
        // SLAVE: Escaneo de vulnerabilidades CVE
        // Trivy es pesado en CPU y RAM
        // Escanea la imagen desde el registry
        // ─────────────────────────────────────────
        stage('Container Scanning — Trivy') {
            agent { label 'slave' }
            steps {
                script {
                    echo "Escaneando imagen Docker en busca de CVEs..."
                    sh """
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:0.69.3 image \
                            --exit-code 1 \
                            --severity CRITICAL \
                            --no-progress \
                            ${REGISTRY}/${DOCKER_IMAGE}:${BRANCH_TAG}
                    """
                }
            }
        }

        // ─────────────────────────────────────────
        // SLAVE: Escaneo de manifiestos Kubernetes
        // Checkov analiza configuraciones IaC
        // Solo necesita Docker — va al slave
        // ─────────────────────────────────────────
        stage('IaC Scanning — Checkov') {
            agent { label 'slave' }
            steps {
                script {
                    echo "Escaneando manifiestos Kubernetes (IaC)..."
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

        // ─────────────────────────────────────────
        // MASTER: Cargar imagen en Minikube
        // Minikube vive en el master
        // Pull desde registry → load en contexto K8s
        // ─────────────────────────────────────────
        stage('Cargar imagen en Minikube') {
            agent { label 'master' }
            steps {
                script {
                    echo "Cargando imagen al contexto interno de Minikube..."
                    sh "minikube image load ${REGISTRY}/${DOCKER_IMAGE}:${BRANCH_TAG}"
                }
            }
        }

        // ─────────────────────────────────────────
        // MASTER: Deploy en Kubernetes
        // kubectl y credenciales viven en el master
        // Namespaces por rama: main=prod, develop=dev
        // ─────────────────────────────────────────
        stage('Deploy en K8s') {
            agent { label 'master' }
            steps {
                withKubeConfig([credentialsId: 'k8s-token',
                               serverUrl: 'https://192.168.49.2:8443']) {
                    script {
                        def namespace = 'default'
                        if (env.BRANCH_NAME == 'main') namespace = 'prod'
                        else if (env.BRANCH_NAME == 'develop') namespace = 'dev'

                        echo "Desplegando en namespace: ${namespace}..."
                        sh "kubectl create namespace ${namespace} --dry-run=client -o yaml | kubectl apply -f -"
                        sh "sed -i 's|image: .*|image: ${REGISTRY}/${DOCKER_IMAGE}:${BRANCH_TAG}|g' k8s/api-deployment.yaml"
                        sh "kubectl apply -f k8s/ -n ${namespace}"
                        sh "kubectl rollout restart deployment node-api -n ${namespace}"
                    }
                }
            }
        }
    }

    // ─────────────────────────────────────────
    // POST: Acciones finales según resultado
    // ─────────────────────────────────────────
    post {
        success {
            echo "Pipeline completado exitosamente."
        }
        failure {
            echo "Pipeline fallido. Revisar logs del stage correspondiente."
        }
        always {
            echo "Pipeline finalizado — rama: ${env.BRANCH_NAME} — tag: ${env.BRANCH_TAG}"
        }
    }
}