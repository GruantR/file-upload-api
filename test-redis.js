const redis = require('./src/config/redis');
const logger = require('./src/utils/logger');

async function test() {
    try {
        await redis.set('test', 'Hello Redis!');
        const value = await redis.get('test');
        logger.info('✅ Value from Redis:', value);
        
        await redis.del('test');
        logger.info('✅ Key deleted');
        
        process.exit(0);
    } catch (err) {
        logger.error('❌ Error:', err);
        process.exit(1);
    }
}

test();