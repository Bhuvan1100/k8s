FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client openssl


COPY package*.json ./
COPY prisma ./prisma
RUN npm install --production

COPY . .

CMD ["sh", "-c", "\
  echo 'Waiting for Postgres...' && \
  until pg_isready -h postgres -p 5432 -U your_db_user; do sleep 2; done && \
  echo 'Postgres is ready' && \
  npx prisma migrate deploy && \
  node src/index.js \
"]
