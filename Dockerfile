# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero para aprovechar caché
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npx tsc

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar dependencias de producción (omitiendo devDependencies)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar archivos compilados desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Variables de entorno por defecto (se sobreescriben en K8s)
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación (nodo procesa desde dist)
CMD ["node", "dist/index.js"]
