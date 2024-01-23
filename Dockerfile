# Utiliza una imagen base con PowerShell y Node.js
FROM mcr.microsoft.com/powershell:latest

# Configura el entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Instala Node.js y npm
RUN apt-get update && \
    apt-get install -y nodejs npm

# Configura el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos del proyecto
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm ci

# Copia el resto de los archivos
COPY . .

# Construye la aplicación
RUN npm run build

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
