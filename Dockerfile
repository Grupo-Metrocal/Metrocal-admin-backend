# Utilizar una imagen de Node.js basada en Alpine Linux
FROM node:18-alpine

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Instalar Puppeteer y dependencias necesarias
RUN apk add --no-cache \
    gcompat \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    tini

# Instalar PowerShell
RUN apk add --no-cache \
    powershell

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación NestJS
RUN npm run build

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start:prod"]