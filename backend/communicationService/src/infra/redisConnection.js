const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;

if (Number.isNaN(REDIS_PORT)) {
  console.error("REDIS_PORT must be a number");
  process.exit(1);
}

console.log(" Redis configuration loaded");
console.log(`   Host : ${REDIS_HOST}`);
console.log(`   Port : ${REDIS_PORT}`);

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT
};
