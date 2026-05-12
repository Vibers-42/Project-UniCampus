/**
 * @file marketplace.integration.test.js — Marketplace Service Integration Tests
 *
 * Covers: create listing, fetch, mark sold, delete (owner vs non-owner), update
 */

jest.mock('../../src/config/firebase', () => ({
  firebaseAdmin: {},
  verifyToken: jest.fn(),
  getFirebaseUser: jest.fn(),
}));

jest.mock('../../src/utils/cleanupUnverifiedUsers', () => ({
  cleanupUnverifiedUsers: jest.fn().mockResolvedValue(null),
}));

// Mock the upload service to prevent real Cloudinary calls during delete
jest.mock('../../src/shared/uploadService', () => ({
  deleteFile: jest.fn().mockResolvedValue(true),
  extractPublicId: jest.fn().mockReturnValue(null),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { verifyToken } = require('../../src/config/firebase');

const SELLER_TOKEN = {
  uid: 'mp-seller-uid',
  email: 'seller@adityauniversity.in',
  email_verified: true,
};

const BUYER_TOKEN = {
  uid: 'mp-buyer-uid',
  email: 'buyer@adityauniversity.in',
  email_verified: true,
};

let sellerUserId;
let buyerUserId;
let createdItemId;

describe('Marketplace Integration', () => {
  beforeAll(async () => {
    const User = mongoose.model('User');

    const seller = await User.findOneAndUpdate(
      { firebaseUid: SELLER_TOKEN.uid },
      {
        firebaseUid: SELLER_TOKEN.uid,
        email: SELLER_TOKEN.email,
        fullName: 'Test Seller',
        role: 'student',
        isVerified: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
    sellerUserId = seller._id.toString();

    const buyer = await User.findOneAndUpdate(
      { firebaseUid: BUYER_TOKEN.uid },
      {
        firebaseUid: BUYER_TOKEN.uid,
        email: BUYER_TOKEN.email,
        fullName: 'Test Buyer',
        role: 'student',
        isVerified: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
    buyerUserId = buyer._id.toString();
  });

  afterAll(async () => {
    const User = mongoose.model('User');
    const MarketplaceItem = mongoose.model('MarketplaceItem');
    await User.deleteMany({ firebaseUid: { $in: [SELLER_TOKEN.uid, BUYER_TOKEN.uid] } });
    if (createdItemId) {
      await MarketplaceItem.deleteMany({ _id: createdItemId });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockResolvedValue(SELLER_TOKEN);
  });

  describe('POST /api/v1/marketplace', () => {
    it('should create a marketplace listing', async () => {
      const res = await request(app)
        .post('/api/v1/marketplace')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Used Textbook - Data Structures',
          description: 'Good condition, minor highlighting',
          price: 250,
          category: 'Books',
          condition: 'Good',
          image: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
          contactInfo: 'seller@adityauniversity.in',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toBe('Used Textbook - Data Structures');
      expect(res.body.data.sellerId).toBe(sellerUserId);
      createdItemId = res.body.data._id;
    });

    it('should reject listing without required fields', async () => {
      await request(app)
        .post('/api/v1/marketplace')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Missing fields' })
        .expect(400);
    });
  });

  describe('GET /api/v1/marketplace', () => {
    it('should fetch marketplace listings', async () => {
      const res = await request(app)
        .get('/api/v1/marketplace')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
  });

  describe('GET /api/v1/marketplace/:id', () => {
    it('should fetch a single listing with seller populated', async () => {
      const res = await request(app)
        .get(`/api/v1/marketplace/${createdItemId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdItemId);
      // Seller should be populated
      expect(res.body.data.sellerId).toHaveProperty('fullName');
    });
  });

  describe('PATCH /api/v1/marketplace/:id/toggle-sold', () => {
    it('should allow seller to toggle sold status', async () => {
      const res = await request(app)
        .patch(`/api/v1/marketplace/${createdItemId}/toggle-sold`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isSold).toBe(true);
    });

    it('should reject non-seller from marking sold', async () => {
      verifyToken.mockResolvedValue(BUYER_TOKEN);

      await request(app)
        .patch(`/api/v1/marketplace/${createdItemId}/toggle-sold`)
        .set('Authorization', 'Bearer buyer-token')
        .expect(403);
    });

    it('should toggle sold back to unsold', async () => {
      const res = await request(app)
        .patch(`/api/v1/marketplace/${createdItemId}/toggle-sold`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.data.isSold).toBe(false);
    });
  });

  describe('DELETE /api/v1/marketplace/:id', () => {
    it('should reject non-owner delete', async () => {
      verifyToken.mockResolvedValue(BUYER_TOKEN);

      await request(app)
        .delete(`/api/v1/marketplace/${createdItemId}`)
        .set('Authorization', 'Bearer buyer-token')
        .expect(403);
    });

    it('should allow owner to soft-delete', async () => {
      const res = await request(app)
        .delete(`/api/v1/marketplace/${createdItemId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
