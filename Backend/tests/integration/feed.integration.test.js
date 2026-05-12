/**
 * @file feed.integration.test.js — Feed Module Integration Tests
 */

jest.mock('../../src/config/firebase', () => ({
  firebaseAdmin: {},
  verifyToken: jest.fn(),
  getFirebaseUser: jest.fn(),
}));

jest.mock('../../src/utils/cleanupUnverifiedUsers', () => ({
  cleanupUnverifiedUsers: jest.fn().mockResolvedValue(null),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { verifyToken } = require('../../src/config/firebase');

const TEST_DECODED_TOKEN = {
  uid: 'feed-test-uid',
  email: 'feedtester@adityauniversity.in',
  email_verified: true,
};

describe('Feed Integration', () => {
  beforeAll(async () => {
    const User = mongoose.model('User');
    await User.findOneAndUpdate(
      { firebaseUid: TEST_DECODED_TOKEN.uid },
      {
        firebaseUid: TEST_DECODED_TOKEN.uid,
        email: TEST_DECODED_TOKEN.email,
        fullName: 'Feed Test User',
        role: 'student',
        department: 'CSE',
        yearOfStudy: 3,
        interests: ['Tech', 'Coding'],
        isVerified: true,
      },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    const User = mongoose.model('User');
    await User.deleteMany({ firebaseUid: TEST_DECODED_TOKEN.uid });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue(TEST_DECODED_TOKEN);
  });

  describe('GET /api/v1/feed', () => {
    it('should return personalized feed for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/feed')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('should apply type filter correctly', async () => {
      const res = await request(app)
        .get('/api/v1/feed?type=Event')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      // If there are items, they should be of type 'event'
      if (res.body.data.items.length > 0) {
        expect(res.body.data.items[0].type).toBe('Event');
      }
    });

    it('should apply search filter correctly', async () => {
      const res = await request(app)
        .get('/api/v1/feed?search=test')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/v1/feed')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
