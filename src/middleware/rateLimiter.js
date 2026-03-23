//src/middleware.rateLimiter.js

const redis = require("../config/redis");
const logger = require("../utils/logger");

const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 5,
    message = "Слишком много запросов, попробуйте позже",
    keyPrefix = "rl",
  } = options;

  return async (req, res, next) => {
    try {
      // 1. Уникальный ключ: IP + (ID пользователя если есть)
      const userId = req.user?.id || "guest";
      const key = `${keyPrefix}:${userId}:${req.ip}`;

      // 2. Увеличиваем счётчик в Redis
      const current = await redis.incr(key);

      // 3. Если первый запрос — устанавливаем время жизни
      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      // 4. Проверяем, не превышен ли лимит
      if (current > max) {
        const ttl = await redis.ttl(key); 
        return res.status(429).json({
          success: false,
          error: {
            code: 429,
            message: `${message}. Попробуйте через ${ttl} сек.`,
            type: "RateLimitError",
          },
        });
      }

      next();
    } catch (err) {
      logger.error("Rate limiter error:", err);
      next();
    }
  };
};

module.exports = rateLimiter;
