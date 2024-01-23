# Usa una imagen de Node para construir la aplicación
# node version 18.0.0
FROM node:18.18.0-alpine3.14 as builder

# Instala las dependencias de compilación
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver

# Configura el entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Cambia a una imagen que incluya PowerShell
FROM mcr.microsoft.com/powershell:latest

WORKDIR /usr/src/app

# Copia los archivos construidos desde la etapa anterior
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

# Instala las dependencias solo necesarias para la ejecución
RUN npm ci --production

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
