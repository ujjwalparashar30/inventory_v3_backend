FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Fix permissions before build
RUN chmod -R 777 /app

RUN npm run build

CMD ["node", "dist/index.js"]
