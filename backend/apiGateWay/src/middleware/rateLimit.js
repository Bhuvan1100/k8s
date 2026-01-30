import redis from "../config/redisClient.js";
import appLogger from "../logger/appLogger.js";
import errorLogger from "../logger/errorLogger.js";
import { randomUUID } from "crypto";

const WINDOW_SEC = 60;
const LIMIT = 20;

const rateLimitMiddleware = async (req, res, next) => {
  const ip = req.ip;

  if (!ip) return next();

  const key = `rate:ip:${ip}`;
  const now = Date.now();
  const windowStart = now - WINDOW_SEC * 1000;

  try {
    const allowed = await redis.rateLimit(
      key,           
      windowStart,    
      LIMIT,          
      now,            
      randomUUID(),   
      WINDOW_SEC      
    );

    if (allowed === 0) {
      appLogger.warn({
        event: "RATE_LIMIT_EXCEEDED",
        ip,
      });

      return res.status(429).json({
        message: "Too many requests, try again later",
      });
    }

    next();
  } catch (err) {
    console.log("error occured")
    errorLogger.error({
      event: "RATE_LIMIT_REDIS_ERROR",
      error: err.message,
      ip,
    });

   
    next();
  }
};

export default rateLimitMiddleware;
