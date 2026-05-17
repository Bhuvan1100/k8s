FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client openssl

COPY package*.json ./
COPY prisma ./prisma
RUN npm install --production

COPY . .

CMD ["sh", "-c", "\
  echo 'Waiting for Postgres...' && \
  until pg_isready -h ${DB_HOST:-postgres} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres}; do sleep 2; done && \
  echo 'Postgres is ready' && \
  npx prisma migrate deploy init && \
  node src/index.js \
"]
