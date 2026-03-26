// test/__mocks__/redis.js

class MockRedis {
  constructor() {
    this.store = new Map(); // In-memory storage for mock Redis
  }

  /**
   * GET - Returns value by key
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} The stored value or null if not found
   */
  async get(key) {
    return this.store.get(key) || null;
  }

  /**
   * SET - Stores value by key
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @returns {Promise<string>} 'OK' on success
   */
  async set(key, value) {
    this.store.set(key, value);
    return "OK";
  }

  /**
   * SETEX - Stores value by key with expiration time (TTL)
   * @param {string} key - The key to store
   * @param {number} seconds - Time to live in seconds (ignored in mock)
   * @param {any} value - The value to store
   * @returns {Promise<string>} 'OK' on success
   */
  async setex(key, seconds, value) {
    this.store.set(key, value);
    return "OK";
  }

  /**
   * INCR - Increments value by 1
   * Used for rate limiting (counts requests)
   * @param {string} key - The key to increment
   * @returns {Promise<number>} New value after increment
   */
  async incr(key) {
    const current = (this.store.get(key) || 0) + 1;
    this.store.set(key, current);
    return current;
  }

  /**
   * DEL - Deletes key
   * @param {string} key - The key to delete
   * @returns {Promise<number>} 1 if key existed, 0 otherwise
   */
  async del(key) {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  /**
   * KEYS - Returns all keys matching pattern
   * Supports only prefix* pattern (e.g., "files:3:*")
   * @param {string} pattern - Pattern to match (e.g., "files:3:*")
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern) {
    const prefix = pattern.replace('*', ''); // Remove trailing *
    const allKeys = Array.from(this.store.keys());
    const filteredKeys = allKeys.filter(key => key.startsWith(prefix));
    return filteredKeys;
  }

  /**
   * EXPIRE - Sets expiration time for key (mock implementation)
   * @returns {Promise<number>} Always returns 1 (success)
   */
  async expire() { return 1; }

  /**
   * TTL - Returns remaining time to live (mock implementation)
   * @returns {Promise<number>} Always returns 60 seconds
   */
  async ttl() { return 60; }

  /**
   * QUIT - Closes Redis connection (mock implementation)
   * @returns {Promise<string>} 'OK'
   */
  async quit() { return 'OK'; }
}

module.exports = new MockRedis();