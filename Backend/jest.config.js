/**
 * @file jest.config.js — Jest Configuration
 *
 * Configures Jest for the UniCampus backend:
 * - CommonJS compatible (no ESM transform needed)
 * - Runs setup file before each test suite
 * - Ignores node_modules and scripts/
 * - 10s timeout for integration tests
 */

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/testSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/mongoSetup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/scripts/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/scripts/**',
    '!src/config/firebase.js',
  ],
  testTimeout: 10000,
  // Pass with no tests so CI doesn't fail when running subset
  passWithNoTests: true,
};
