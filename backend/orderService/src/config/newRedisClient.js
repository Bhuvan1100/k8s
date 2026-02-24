import { createClient } from "redis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;

const redis = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error("Redis reconnect failed");
      return Math.min(retries * 100, 3000);
    }
  }
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis Error:", err));

await redis.connect();

export default redis;