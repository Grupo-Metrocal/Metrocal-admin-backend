# Utiliza la imagen oficial de Microsoft con PowerShell
FROM mcr.microsoft.com/powershell:latest

# Configura el entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Comando para ejecutar el servidor y la aplicación
CMD ["npm", "run", "start:prod"]
