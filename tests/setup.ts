/**
 * Test Setup
 * Global test configuration and database setup
 */

import { sequelize } from '../src/config/sequelize';
import { redis } from '../src/config/redis';

// Set test environment
process.env.NODE_ENV = 'test';
// Use DB_NAME from env (set by CI) or fallback to test database name
if (!process.env.DB_NAME) {
  process.env.DB_NAME = process.env.DB_NAME_TEST || 'omotenashi_test';
}
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';

// Ensure models are loaded before sync
import '../src/models';

beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate();
  
  // Enable required PostgreSQL extensions
  try {
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "citext";');
  } catch (error) {
    // Extensions might already exist, ignore
    console.warn('Extension creation warning (may already exist):', error);
  }
  
  // Drop all tables and types first to ensure clean state
  try {
    await sequelize.drop({ cascade: true });
  } catch (error) {
    // Ignore if nothing to drop
    console.warn('Drop tables warning (may be empty):', error);
  }
  
  // Sync all models (force: true drops existing tables)
  try {
    await sequelize.sync({ force: true, alter: false });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to sync database:', errorMessage);
    // Re-throw with more context
    throw new Error(`Database sync failed: ${errorMessage}`);
  }
  
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

