FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm ci

COPY . .

# Create dist directory and set ownership
RUN mkdir -p dist && \
    chown -R node:node /app/node_modules /app/dist

# Switch to node user for building
USER node
RUN npm run build

# Switch back to root for running (if needed for your app)
USER root
CMD ["node", "dist/index.js"]