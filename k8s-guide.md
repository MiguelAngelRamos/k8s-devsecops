# Guía de Despliegue en Kubernetes (Minikube)

Esta guía explica paso a paso cómo desplegar la API Node (ahora con PostgreSQL) en un clúster local usando Minikube.

## 1. Requisitos Previos

- Tener instalado **Docker**, **Minikube** y **kubectl**.
- Tener el clúster de Minikube en ejecución:
  ```bash
  minikube start
  ```
- (Opcional pero recomendado para HPA) Habilitar el servidor de métricas:
  ```bash
  minikube addons enable metrics-server
  ```

## 2. Construir la Imagen de Docker

Vamos a construir la imagen de Docker localmente.

```bash
# Navegar al directorio raíz del proyecto
docker build -t node-api-ts:latest .
```

## 3. Cargar la Imagen en Minikube

Minikube tiene su propio entorno Docker (daemon). Para que Kubernetes pueda usar la imagen local (`node-api-ts:latest`) sin intentar descargarla de Docker Hub, debemos cargarla en el nodo de Minikube. A continuación se presentan las dos formas principales para hacerlo:

### Opción A: Usando la CLI de Minikube (Entorno Local)

```bash
minikube image load node-api-ts:latest
```

*(Nota: Si usas una versión reciente de Minikube en tu usuario principal, puedes apuntar al Docker Daemon de Minikube ejecutando: `eval $(minikube docker-env)`, y luego construir la imagen para que quede directamente disponible).*

### Opción B: Usando `docker exec` (Recomendado para Jenkins / CI)

En entornos de Integración Continua (CI) como Jenkins, suele haber un problema de permisos: el usuario `jenkins` no tiene acceso al perfil de Minikube de tu usuario del sistema (ej. `miguel`). Sin embargo, si el usuario `jenkins` tiene permisos en el host para ejecutar Docker, podemos saltarnos este problema empaquetando e inyectando la imagen directamente:

```bash
docker save node-api-ts:latest | docker exec -i minikube docker load
```

**¿Por qué es necesario este cambio?**
El cluster de Minikube (cuando usa el driver de Docker) corre como un contenedor en el host llamado `minikube`. Con esta técnica evitamos completamente invocar la CLI de `minikube` (la cual falla por error de perfil/permisos) y aprovechamos el socket de Docker para introducir la imagen (ya que Jenkins sí tiene permisos sobre Docker).

## 4. Aplicar los Manifiestos de Kubernetes

Aplicamos todos los archivos de configuración YAML ubicados en la carpeta `k8s/`.

```bash
# Aplicar todos los manifiestos en la ruta k8s/
kubectl apply -f k8s/
```

### El orden en que se despliegan recursos (si lo haces manualmente)
1. **Secret & ConfigMap**: Para almacenar contraseñas y variables de entorno.
2. **Postgres PVC**: Volumen persistente para que la BD no pierda datos al reiniciarse.
3. **Postgres Deployment & Service**: Se levanta la base de datos y su red interna.
4. **Node API Deployment & Service**: Levanta la app conectada al servicio `postgres-service`.
5. **Autoscaling (HPA)**: Aplica reglas de escalamiento horizontal (CPU y RAM).

## 5. Verificar el Estado del Despliegue

Puedes monitorizar que todo esté levantando correctamente especificando el namespace correspondiente (ej. `prod` si desplegaste desde la rama `main`, o `dev` desde la rama `develop`):

```bash
# Ver todos los recursos del namespace a la vez
kubectl get all -n prod

# O ver los componentes por separado:
# Ver los Pods (esperar a que estén en estado Running)
kubectl get pods -w -n prod

# Ver los Servicios
kubectl get svc -n prod

# Ver el estado del Autoescalador (HPA)
kubectl get hpa -n prod
```

*Nota: Es normal que Postgres tarde un poco más en levantar la primera vez debido a la creación del almacenamiento persistente.*

## 6. Acceder a la API

Ya que el servicio `node-api-service` es de tipo `LoadBalancer` y estamos en Minikube, puedes acceder al mismo utilizando el siguiente comando. Recuerda siempre especificar el namespace (`-n prod`):

```bash
# Esto abrirá el navegador automático o generará una URL
minikube service node-api-service -n prod
```
También puedes usar Port-Forward para mapear el puerto internamente hacia tu host:
```bash
# Usamos el puerto local 3001 para evitar conflictos si el puerto 3000 ya está ocupado (por ej. por Grafana)
kubectl port-forward svc/node-api-service 3001:80 -n prod
```

### Probar los Endpoints de la API desde Postman

Una vez que tengas el proceso de Port-Forward corriendo en tu terminal, abre tu cliente de **Postman** y crea los siguientes requests apuntando a la dirección base `http://localhost:3001`:

**1. Consulta de Estado (Health Check)**
- **Método**: `GET`
- **URL**: `http://localhost:3001/health`
- **Cuerpo (Body)**: Ninguno
- *Pruébalo y verifica que la API te regrese un código HTTP 200 OK informando el estado.*

**2. Crear un Recurso (Registro de Usuario)**
- **Método**: `POST`
- **URL**: `http://localhost:3001/auth/register`
- **Pestaña Body**: Selecciona **raw** y luego en la lista desplegable de la derecha elige **JSON**.
- **Contenido del Body**: Pega el siguiente JSON con los datos del usuario a crear:
  ```json
  {
    "name": "Miguel",
    "email": "miguel@example.com",
    "password": "password123"
  }
  ```

## 7. Eliminar el Despliegue (Limpieza)

Si quieres borrar todo lo creado:

```bash
kubectl delete -f k8s/
```
