import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 2000,
  maxRetriesPerRequest: 2,
});

const RATE_LIMIT_LUA = `
redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, ARGV[1])
local count = redis.call("ZCARD", KEYS[1])

if count >= tonumber(ARGV[2]) then
  return 0
end

redis.call("ZADD", KEYS[1], ARGV[3], ARGV[4])
redis.call("EXPIRE", KEYS[1], ARGV[5])
return 1
`;

redis.defineCommand("rateLimit", {
  numberOfKeys: 1,
  lua: RATE_LIMIT_LUA,
});

export default redis;
