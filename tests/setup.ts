/**
 * Test Setup
 * Global test configuration and database setup
 */

import { sequelize } from '../src/config/sequelize';
import { redis } from '../src/config/redis';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME_TEST || 'omotenashi_test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
  
  // Sync all models (force: true drops existing tables)
  await sequelize.sync({ force: true });
  
  // Connect Redis if needed
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
  } catch (error) {
    // Redis connection is optional for tests
    console.warn('Redis connection failed in tests:', error);
  }
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
  
  // Close Redis connection
  try {
    if (redis.isOpen) {
      await redis.quit();
    }
  } catch {
    // Ignore Redis errors
  }
});

beforeEach(async () => {
  // Clean up test data before each test
  // This is handled in individual test files
});

