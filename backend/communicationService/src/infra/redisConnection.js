import dotenv from "dotenv";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;

if (Number.isNaN(REDIS_PORT)) {
  console.error("REDIS_PORT must be a number");
  process.exit(1);
}

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};
