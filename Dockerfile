# Dockerfile

# ---- Etapa de Build ----
# Usamos una imagen de Node.js versión 18 para construir el proyecto
FROM node:18-alpine AS builder
WORKDIR /app

ARG DATABASE_URL
ARG PULSE_API_KEY


# 👇 Establecerlos como variables de entorno para el proceso de build
ENV DATABASE_URL=$DATABASE_URL
ENV PULSE_API_KEY=$PULSE_API_KEY


# Copiamos los archivos de manifiesto del paquete
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Construimos la aplicación para producción
RUN npm run build

# ---- Etapa de Producción ----
# Empezamos desde una imagen de Node.js limpia y ligera
FROM node:18-alpine
WORKDIR /app

# Copiamos solo los artefactos necesarios desde la etapa 'builder'
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Exponemos el puerto 3000, que es donde corre Next.js
EXPOSE 3000

# El comando para iniciar la aplicación
CMD ["npm", "start"]