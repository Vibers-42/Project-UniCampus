/**
 * @file testSetup.js — Global Test Setup
 *
 * Runs before each test suite. Sets environment variables
 * for test isolation without connecting to real services.
 */

// Set test environment variables BEFORE any module loads
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Random port
process.env.MONGODB_URI = 'mongodb://localhost:27017/unicampus_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ALLOWED_DOMAIN = 'adityauniversity.in';
process.env.CLIENT_URL = 'http://localhost:5173';

// Suppress logger output during tests
jest.mock('../../src/shared/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  debug: jest.fn(),
}));
