// test/__tests__/redis.mock.test.js
const redis = require('../../src/config/redis');

describe('Redis Mock', () => {
  it('should store and retrieve data', async () => {
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    expect(value).toBe('test-value');
  });

  it('should increment counter', async () => {
    const count1 = await redis.incr('counter');
    const count2 = await redis.incr('counter');
    expect(count1).toBe(1);
    expect(count2).toBe(2);
  });

  it('should delete keys', async () => {
    await redis.set('to-delete', 'something');
    await redis.del('to-delete');
    const value = await redis.get('to-delete');
    expect(value).toBeNull();
  });

  it('should find keys by pattern', async () => {
    await redis.set('files:1:offset:0', 'data1');
    await redis.set('files:1:offset:10', 'data2');
    await redis.set('files:2:offset:0', 'data3');
    
    const keys = await redis.keys('files:1:*');
    expect(keys).toContain('files:1:offset:0');
    expect(keys).toContain('files:1:offset:10');
    expect(keys).not.toContain('files:2:offset:0');
  });
});