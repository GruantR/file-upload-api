// src/__tests__/setup.js
require('dotenv').config({ path: '.env.test' });
// Mock Redis
jest.mock('../../src/config/redis', () => require('../__mocks__/redis'));
// Mock S3Storage
jest.mock('../../src/storage/drivers/S3Storage', () => require('../__mocks__/s3Storage'));

const { sequelize } = require('../../src/models');
const app = require('../../src/app');
const request = require('supertest');
const redis = require('../../src/config/redis'); 



// Before all tests, create a clean table.
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// После всех тестов — After all tests, close the connection.
afterAll(async () => {
  await sequelize.close();
  await redis.quit();
});

module.exports = request(app);