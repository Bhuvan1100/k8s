FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "\
  echo 'Waiting for Meilisearch...' && \
  until curl -s http://meilisearch:7700/health > /dev/null; do sleep 2; done && \
  echo 'Meilisearch is ready' && \
  node src/config/meiliSearchSetUp.js && \
  node src/index.js \
"]
