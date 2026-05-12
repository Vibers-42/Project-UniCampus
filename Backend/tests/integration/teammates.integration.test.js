/**
 * @file teammates.integration.test.js — Teammates Module Integration Tests
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
  uid: 'teammates-test-uid',
  email: 'teammates@adityauniversity.in',
  email_verified: true,
};

const OTHER_USER_TOKEN = {
  uid: 'other-user-uid',
  email: 'other@adityauniversity.in',
  email_verified: true,
};

let testUserId;
let otherUserId;
let createdTeammateId;

describe('Teammates Integration', () => {
  beforeAll(async () => {
    const User = mongoose.model('User');
    const testUser = await User.findOneAndUpdate(
      { firebaseUid: TEST_DECODED_TOKEN.uid },
      {
        firebaseUid: TEST_DECODED_TOKEN.uid,
        email: TEST_DECODED_TOKEN.email,
        fullName: 'Teammate Test User',
        role: 'student',
        isVerified: true,
      },
      { upsert: true, new: true }
    );
    testUserId = testUser._id;

    const otherUser = await User.findOneAndUpdate(
      { firebaseUid: OTHER_USER_TOKEN.uid },
      {
        firebaseUid: OTHER_USER_TOKEN.uid,
        email: OTHER_USER_TOKEN.email,
        fullName: 'Other User',
        role: 'student',
        isVerified: true,
      },
      { upsert: true, new: true }
    );
    otherUserId = otherUser._id;
  });

  afterAll(async () => {
    const User = mongoose.model('User');
    const TeamProject = mongoose.model('TeamProject');
    await User.deleteMany({ firebaseUid: { $in: [TEST_DECODED_TOKEN.uid, OTHER_USER_TOKEN.uid] } });
    await TeamProject.deleteMany({ creatorId: { $in: [testUserId, otherUserId] } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue(TEST_DECODED_TOKEN);
  });

  describe('POST /api/v1/teammates', () => {
    it('should create a teammate listing', async () => {
      const res = await request(app)
        .post('/api/v1/teammates')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Looking for hackathon team',
          shortDescription: 'Need frontend devs for hackathon',
          detailedDescription: 'We are building a blockchain project for the upcoming college hackathon.',
          problemStatement: 'Solving decentralized identity.',
          category: 'hackathon',
          requiredTeamSize: 4,
          contactInfo: 'email@test.com',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          techStack: ['React', 'Node.js']
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('project');
      createdTeammateId = res.body.data.project._id;
    });

    it('should reject invalid listing (missing title)', async () => {
      const res = await request(app)
        .post('/api/v1/teammates')
        .set('Authorization', 'Bearer valid-token')
        .send({
          description: 'No title'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/teammates', () => {
    it('should fetch teammate listings', async () => {
      const res = await request(app)
        .get('/api/v1/teammates')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.projects)).toBe(true);
      expect(res.body.data.projects.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/teammates/:id', () => {
    it('should reject unauthorized delete (different user)', async () => {
      // Mock auth as the other user
      verifyToken.mockResolvedValue(OTHER_USER_TOKEN);

      const res = await request(app)
        .delete(`/api/v1/teammates/${createdTeammateId}`)
        .set('Authorization', 'Bearer other-token')
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized|forbidden|No project found|permission/i);
    });

    it('should allow owner to delete', async () => {
      const res = await request(app)
        .delete(`/api/v1/teammates/${createdTeammateId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(204);
      
      // Verify deletion
      const getRes = await request(app)
        .get(`/api/v1/teammates/${createdTeammateId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });
});
