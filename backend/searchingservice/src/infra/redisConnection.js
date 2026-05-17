import dotenv from "dotenv";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;

if (!REDIS_HOST || !REDIS_PORT) {
  console.error("❌ Redis configuration missing");
  process.exit(1);
}

console.log(" Initializing Redis connection...");
console.log(` Host: ${REDIS_HOST}`);
console.log(` Port: ${REDIS_PORT}`);
console.log(` Auth: ${REDIS_PASSWORD ? "Enabled" : "Disabled"}`);

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};
