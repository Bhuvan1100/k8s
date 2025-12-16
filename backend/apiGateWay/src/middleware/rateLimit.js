import redis from "./redisClient.js";

const RATE_LIMIT = 100;
const WINDOW_SEC = 60;

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const key = `rate:${req.ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, WINDOW_SEC);
    }

    if (current > RATE_LIMIT) {
      return res.status(429).json({
        message: "Too many requests, try again later"
      });
    }

    next();
  } catch (err) {
    next();
  }
};

export default rateLimitMiddleware;
