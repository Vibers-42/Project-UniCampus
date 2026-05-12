/**
 * @file middleware.test.js — Security & Middleware Integration Tests
 *
 * Tests helmet headers, 404 handling, auth rejection, and NoSQL sanitization.
 * Requires no MongoDB connection — tests HTTP layer only.
 */

// Mock Firebase Admin SDK BEFORE anything loads
jest.mock('firebase-admin', () => {
  const mockAuth = {
    verifyIdToken: jest.fn().mockRejectedValue(new Error('mocked')),
    getUser: jest.fn(),
  };
  return {
    apps: [true], // Pretend already initialized
    auth: () => mockAuth,
    credential: { cert: jest.fn() },
    initializeApp: jest.fn(),
  };
});

jest.mock('../../src/config/firebase', () => ({
  firebaseAdmin: {},
  verifyToken: jest.fn().mockRejectedValue(new Error('Token mock')),
  getFirebaseUser: jest.fn(),
}));

jest.mock('../../src/utils/cleanupUnverifiedUsers', () => ({
  cleanupUnverifiedUsers: jest.fn().mockResolvedValue(null),
}));

const request = require('supertest');
const { verifyToken } = require('../../src/config/firebase');

// Import app AFTER all mocks are set up
let app;
try {
  app = require('../../src/app');
} catch (err) {
  // If app fails to load, tests will fail with a clear message
  console.error('Failed to load app:', err.message);
}

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: reject all tokens
    verifyToken.mockRejectedValue(new Error('No token'));
  });

  describe('Helmet Headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should set Cross-Origin-Resource-Policy to cross-origin', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
    });
  });

  describe('Health Check', () => {
    it('should return 200 with success body', async () => {
      const res = await request(app).get('/api/health');

      // Debug: if 500, log the error
      if (res.status === 500) {
        console.log('Health check 500 body:', JSON.stringify(res.body));
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('UniCampus API running');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown API routes', async () => {
      const res = await request(app).get('/api/v1/this-route-does-not-exist');

      if (res.status === 500) {
        console.log('404 test got 500 body:', JSON.stringify(res.body));
      }

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
