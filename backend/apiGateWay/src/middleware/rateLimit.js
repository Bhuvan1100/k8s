import redis from "../config/redisClient.js";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";

const WINDOW_SEC = 60;
const LIMIT = 20;

const rateLimitMiddleware = async (req, res, next) => {
  const ip = req.ip;

  if (!ip) return next();

  const key = `rate:ip:${ip}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, WINDOW_SEC);
    }

    if (current > LIMIT) {
      appLogger.warn({
        event: "RATE_LIMIT_EXCEEDED",
        ip,
        count: current
      });

      return res.status(429).json({
        message: "Too many requests, try again later"
      });
    }

    next();

  } catch (err) {
    errorLogger.error({
      event: "RATE_LIMIT_REDIS_ERROR",
      error: err.message,
      ip
    });

    next();
  }
};

export default rateLimitMiddleware;