const REDIS_HOST = process.env.REDIS_HOST  
const REDIS_PORT = process.env.REDIS_PORT

console.log(" Redis configuration loaded");
console.log(`   Host : ${REDIS_HOST}`);
console.log(`   Port : ${REDIS_PORT}`);

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT
};
