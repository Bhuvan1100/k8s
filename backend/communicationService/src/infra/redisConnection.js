const REDIS_HOST = "redis";  
const REDIS_PORT = 6379;

console.log(" Redis configuration loaded");
console.log(`   Host : ${REDIS_HOST}`);
console.log(`   Port : ${REDIS_PORT}`);

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT
};
