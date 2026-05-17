import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 2000,
  maxRetriesPerRequest: 5,
});

redis.on("connect", () => {
  console.log("Redis connected correctly");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

export default redis;
