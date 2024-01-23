# Use the Puppeteer base image
FROM ghcr.io/puppeteer/puppeteer:21.3.8

# Install prerequisites
RUN apt-get update && apt-get install -y wget apt-transport-https software-properties-common

# Install PowerShell Core
RUN wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y powershell \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the entire application to the working directory
COPY . .

# Build the application
RUN npm run build

# Command to run when the container starts
CMD ["npm", "run", "start:prod"]
