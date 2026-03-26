// src/middleware/rateLimiter.js
const redis = require("../config/redis");
const logger = require("../utils/logger");

const rateLimiter = (options = {}) => {
  // Отключаем rate limiter в тестах
  if (process.env.NODE_ENV === 'test' || process.env.RATE_LIMIT_ENABLED === 'false') {
    return (req, res, next) => next();
  }

  const {
    windowMs = 60 * 1000,
    max = 5,
    message = "Too many requests, please try again later",
    keyPrefix = "rl",
  } = options;

  return async (req, res, next) => {
    try {
      const userId = req.user?.id || "guest";
      const key = `${keyPrefix}:${userId}:${req.ip}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > max) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          error: {
            code: 429,
            message: `${message}. Try again in ${ttl} seconds.`,
            type: "RateLimitError",
          },
        });
      }

      next();
    } catch (err) {
      if (!req._rateLimiterErrorLogged) {
        logger.error("Rate limiter error (Redis unavailable):", err.message);
        req._rateLimiterErrorLogged = true;
      }
      next();
    }
  };
};

module.exports = rateLimiter;