# Guía: Gestión de Vulnerabilidades SCA con npm audit en el Pipeline

## Contexto

Durante la ejecución del pipeline en la rama `main`, el stage **Tests & SCA** comenzó a fallar
**no por los tests** (que pasaron 23/23 con cobertura del 100%), sino por el step de auditoría
de dependencias.

---

## Cómo lucía el pipeline originalmente

El stage `Tests & SCA` tenía este bloque en el Jenkinsfile:

```groovy
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
            sh 'npm ci'
            sh 'npm run test:ci'

            echo "Analizando vulnerabilidades en dependencias (SCA — npm audit)..."
            sh 'npm audit --audit-level=high'
        }
    }
}
```

### Por qué fallaba

El comando `npm audit --audit-level=high` retorna **exit code 1** cuando encuentra
vulnerabilidades de severidad `high` o `critical`. Jenkins interpreta exit code distinto
de 0 como fallo del stage, lo que bloqueaba todos los stages siguientes:

```
ERROR: script returned exit code 1
Finished: FAILURE
```

Las vulnerabilidades detectadas eran:

| Paquete     | Severidad | CVE / Advisory                          |
|-------------|-----------|------------------------------------------|
| `diff`      | low       | GHSA-73rr-hh4g-fpgx (DoS en parsePatch) |
| `jws`       | **high**  | GHSA-869p-cjfg-cm3x (HMAC bypass)       |
| `minimatch` | **high**  | GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74 (ReDoS) |
| `qs`        | moderate  | GHSA-w7fw-mjwx-w883, GHSA-6rw7-vpxm-498p (DoS) |

> Todas estas vulnerabilidades provienen de paquetes de **desarrollo** (principalmente `jest`),
> no de dependencias de producción.

---

## Análisis de las opciones disponibles

Ante este problema se evaluaron 3 alternativas:

### Opción 1 — `npm audit fix` ✅ Elegida
Actualiza automáticamente las dependencias vulnerables a versiones seguras compatibles con
el semver declarado en `package.json`. Las correcciones quedan registradas en el repositorio.

**Ventaja:** El repositorio queda limpio y el estado real de las dependencias es auditable.  
**Desventaja:** Requiere que el desarrollador ejecute el fix localmente y commitee los cambios.

### Opción 2 — Cambiar `--audit-level=high` por `--audit-level=critical`
Solo falla el pipeline ante vulnerabilidades críticas, ignorando las `high`.

**Ventaja:** El pipeline pasa sin cambios en dependencias.  
**Desventaja:** Se ignoran vulnerabilidades `high` que pueden ser explotables. No es una
práctica aceptable en DevSecOps.

### Opción 3 — `npm audit --omit=dev`
Solo audita dependencias de producción. Como todas las vulnerables provienen de paquetes
de dev, el audit no las reportaría.

**Ventaja:** Técnicamente correcto si se acepta que las dependencias de dev no llegan a producción.  
**Desventaja:** Oculta el problema en lugar de resolverlo. No es ideal para mantener
las dependencias de dev saludables.

---

## Decisión tomada

Se eligió la **Opción 1** porque:

1. **Corrige el problema en el origen** — Las dependencias vulnerables se actualizan de verdad.
2. **Principio de Infraestructura como Código** — El estado de las dependencias queda reflejado
   en el repositorio (`package.json` y `package-lock.json`), no en un workspace efímero de Jenkins.
3. **Trazabilidad** — Cualquier miembro del equipo puede ver en el historial de git cuándo y
   por qué se actualizaron las dependencias.
4. **El pipeline es un verificador, no un reparador** — Jenkins debe detectar problemas, no
   enmascarlos ni corregirlos en caliente sin dejar rastro.

---

## Cómo quedó el Jenkinsfile

```groovy
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
```

---

## Pasos que debe ejecutar el desarrollador para resolver el fallo

Estos comandos se ejecutan **localmente** en el proyecto, no en Jenkins:

```bash
# 1. Verificar las vulnerabilidades actuales
npm audit

# 2. Aplicar las correcciones automáticas (actualiza package.json y package-lock.json)
npm audit fix

# 3. Confirmar que el audit ya no reporta severidad high o critical
npm audit --audit-level=high

# 4. Revisar qué cambió
git diff package.json package-lock.json

# 5. Commitear los cambios de dependencias al repositorio
git add package.json package-lock.json
git commit -m "fix: corrige vulnerabilidades de dependencias con npm audit fix"
git push
```

> **Importante:** Solo `package.json` y `package-lock.json` deben commitearse.
> La carpeta `node_modules/` nunca se commitea (está en `.gitignore`).

---

## ¿Cuándo vuelvo a necesitar hacer esto?

El pipeline fallará en el step de `npm audit` en dos situaciones:

1. **Se añade una nueva dependencia** que tiene vulnerabilidades conocidas.
2. **Se publica un nuevo CVE** contra una dependencia que ya estaba en el proyecto.

Para evitar que estas situaciones sean sorpresas, se recomienda configurar
**[Dependabot](https://docs.github.com/es/code-security/dependabot)** en el repositorio de GitHub,
el cual abre Pull Requests automáticos cuando detecta vulnerabilidades en las dependencias.
