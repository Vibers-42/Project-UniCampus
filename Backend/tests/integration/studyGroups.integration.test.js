/**
 * @file studyGroups.integration.test.js — Study Groups Integration Tests (canonical)
 *
 * Tests the canonical study group routes at /api/v1/study-groups
 * which use controllers/studygroup.controller.js + models/StudyGroup.js
 *
 * Covers: create, fetch, join, leave, membership enforcement
 */

jest.mock('../../src/config/firebase', () => ({
  firebaseAdmin: {},
  verifyToken: jest.fn(),
  getFirebaseUser: jest.fn(),
}));

jest.mock('../../src/utils/cleanupUnverifiedUsers', () => ({
  cleanupUnverifiedUsers: jest.fn().mockResolvedValue(null),
}));

// Mock notification service to prevent DB/socket failures
jest.mock('../../src/shared/notificationService', () => ({
  sendInAppNotification: jest.fn().mockResolvedValue(null),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { verifyToken } = require('../../src/config/firebase');

const ADMIN_TOKEN = {
  uid: 'sg-admin-uid',
  email: 'sgadmin@adityauniversity.in',
  email_verified: true,
};

const MEMBER_TOKEN = {
  uid: 'sg-member-uid',
  email: 'sgmember@adityauniversity.in',
  email_verified: true,
};

let adminUserId;
let memberUserId;
let createdGroupId;

describe('Study Groups Integration (canonical)', () => {
  beforeAll(async () => {
    const User = mongoose.model('User');

    const admin = await User.findOneAndUpdate(
      { firebaseUid: ADMIN_TOKEN.uid },
      {
        firebaseUid: ADMIN_TOKEN.uid,
        email: ADMIN_TOKEN.email,
        fullName: 'Group Admin',
        role: 'student',
        isVerified: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
    adminUserId = admin._id.toString();

    const member = await User.findOneAndUpdate(
      { firebaseUid: MEMBER_TOKEN.uid },
      {
        firebaseUid: MEMBER_TOKEN.uid,
        email: MEMBER_TOKEN.email,
        fullName: 'Group Member',
        role: 'student',
        isVerified: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
    memberUserId = member._id.toString();
  });

  afterAll(async () => {
    const User = mongoose.model('User');
    const Group = mongoose.model('Group');
    await User.deleteMany({ firebaseUid: { $in: [ADMIN_TOKEN.uid, MEMBER_TOKEN.uid] } });
    if (createdGroupId) {
      await Group.deleteMany({ _id: createdGroupId });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue(ADMIN_TOKEN);
  });

  describe('POST /api/v1/study-groups', () => {
    it('should create a study group', async () => {
      const res = await request(app)
        .post('/api/v1/study-groups')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'DSA Practice Group',
          description: 'Daily practice for placements',
          subject: 'Data Structures',
          department: 'CSE',
          semester: 4,
          year: 2,
          category: 'study',
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe('DSA Practice Group');
      // Admin should be in members list
      expect(res.body.data.members).toContain(adminUserId);
      createdGroupId = res.body.data._id;
    });

    it('should reject unauthenticated create', async () => {
      await request(app)
        .post('/api/v1/study-groups')
        .send({ name: 'test', subject: 'test', department: 'CSE', semester: 1, year: 1 })
        .expect(401);
    });
  });

  describe('GET /api/v1/study-groups', () => {
    it('should fetch all groups', async () => {
      const res = await request(app)
        .get('/api/v1/study-groups')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('should filter by tab (my-groups)', async () => {
      const res = await request(app)
        .get('/api/v1/study-groups?tab=my-groups')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/study-groups/:id/join', () => {
    it('should allow another user to join', async () => {
      verifyToken.mockResolvedValue(MEMBER_TOKEN);

      const res = await request(app)
        .post(`/api/v1/study-groups/${createdGroupId}/join`)
        .set('Authorization', 'Bearer member-token');
      
      expect(res.status).toBe(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.members).toContain(memberUserId);
    });

    it('should reject duplicate join', async () => {
      verifyToken.mockResolvedValue(MEMBER_TOKEN);

      await request(app)
        .post(`/api/v1/study-groups/${createdGroupId}/join`)
        .set('Authorization', 'Bearer member-token')
        .expect(400);
    });
  });

  describe('GET /api/v1/study-groups/:id', () => {
    it('should fetch group details for a member', async () => {
      verifyToken.mockResolvedValue(MEMBER_TOKEN);

      const res = await request(app)
        .get(`/api/v1/study-groups/${createdGroupId}`)
        .set('Authorization', 'Bearer member-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.group._id).toBe(createdGroupId);
      // Members should be populated
      expect(res.body.data.group.members[0]).toHaveProperty('fullName');
    });
  });

  describe('POST /api/v1/study-groups/:id/leave', () => {
    it('should allow a member to leave', async () => {
      verifyToken.mockResolvedValue(MEMBER_TOKEN);

      const res = await request(app)
        .post(`/api/v1/study-groups/${createdGroupId}/leave`)
        .set('Authorization', 'Bearer member-token')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should reject leave for non-members', async () => {
      verifyToken.mockResolvedValue(MEMBER_TOKEN);

      await request(app)
        .post(`/api/v1/study-groups/${createdGroupId}/leave`)
        .set('Authorization', 'Bearer member-token')
        .expect(400);
    });
  });
});
