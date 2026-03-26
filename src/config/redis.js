// src/config/redis.js
const Redis = require("ioredis");
const logger = require("../utils/logger");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || "6379",
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error("Redis unavailable, stopping reconnect attempts");
      return null;
    }
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
});

redis.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    logger.error("Redis unavailable:", err.message);
  }
  if (!redis._errorLogged) {
    logger.error("Redis unavailable:", err.message);
    redis._errorLogged = true;
  }
});

redis.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    logger.info("Redis connected");
  }

  redis._errorLogged = false;
  logger.info("Redis connected");
});

module.exports = redis;
