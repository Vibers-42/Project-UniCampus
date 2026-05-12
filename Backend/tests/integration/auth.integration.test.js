/**
 * @file auth.integration.test.js — Auth Module Integration Tests
 *
 * Tests the /api/v1/auth endpoints with mocked Firebase.
 * Verifies:
 *   - Token verification middleware
 *   - Sync flow (user creation/retrieval)
 *   - Protected route rejection without token
 *   - Protected route access with valid token
 */

// Mock Firebase Admin SDK BEFORE any module loads
jest.mock('../../src/config/firebase', () => ({
  firebaseAdmin: {},
  verifyToken: jest.fn(),
  getFirebaseUser: jest.fn(),
}));

// Mock the cleanup utility to prevent cron issues
jest.mock('../../src/utils/cleanupUnverifiedUsers', () => ({
  cleanupUnverifiedUsers: jest.fn().mockResolvedValue(null),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { verifyToken } = require('../../src/config/firebase');

// Test user data
const TEST_FIREBASE_UID = 'test-firebase-uid-123';
const TEST_EMAIL = 'testuser@adityauniversity.in';
const TEST_DECODED_TOKEN = {
  uid: TEST_FIREBASE_UID,
  email: TEST_EMAIL,
  email_verified: true,
};

describe('Auth Integration', () => {
  beforeAll(async () => {
    // Connect to test database
    const testUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/unicampus_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testUri);
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (mongoose.connection.readyState === 1) {
      const User = mongoose.model('User');
      await User.deleteMany({ email: TEST_EMAIL });
      await mongoose.connection.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without Authorization header', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      verifyToken.mockRejectedValue(new Error('Invalid token'));

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/sync', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sync')
        .send({})
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should create user on first sync with valid token', async () => {
      verifyToken.mockResolvedValue(TEST_DECODED_TOKEN);

      const res = await request(app)
        .post('/api/v1/auth/sync')
        .set('Authorization', `Bearer valid-mock-token`)
        .send({
          fullName: 'Test User',
          rollNumber: 'TEST001',
          department: 'CSE',
          yearOfStudy: 3,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe(TEST_EMAIL);
    });

    it('should return existing user on second sync (idempotent)', async () => {
      verifyToken.mockResolvedValue(TEST_DECODED_TOKEN);

      const res = await request(app)
        .post('/api/v1/auth/sync')
        .set('Authorization', `Bearer valid-mock-token`)
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(TEST_EMAIL);
    });
  });
});
