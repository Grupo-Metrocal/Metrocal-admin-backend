FROM mcr.microsoft.com/powershell:latest

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./

# Verificar la instalación de Node.js y npm
RUN node -v
RUN npm -v

RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]
