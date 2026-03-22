//src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    }
});

redis.on('connect', () => {
    logger.info('✅ Redis подключен');
});

redis.on('error', (err) => {
    logger.error('❌ Ошибка Redis:', err.message);
});

module.exports = redis;