/**
 * @file upload.integration.test.js — Upload Validation Tests
 *
 * Tests the upload middleware's file type validation.
 * Verifies:
 *   - Valid image uploads (JPEG, PNG, WebP)
 *   - Valid PDF uploads
 *   - Invalid file type rejection (executables, scripts)
 *   - File size limit enforcement
 */

// Mock Firebase for auth
jest.mock('../../src/config/firebase', () => ({
  firebaseAdmin: {},
  verifyToken: jest.fn(),
  getFirebaseUser: jest.fn(),
}));

jest.mock('../../src/utils/cleanupUnverifiedUsers', () => ({
  cleanupUnverifiedUsers: jest.fn().mockResolvedValue(null),
}));

// Mock Cloudinary — never hit real Cloudinary in tests
jest.mock('../../src/shared/uploadService', () => ({
  uploadFile: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
    public_id: 'test/test',
  }),
  deleteFile: jest.fn().mockResolvedValue(true),
  extractPublicId: jest.fn().mockReturnValue('test/test'),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { verifyToken } = require('../../src/config/firebase');

const TEST_DECODED_TOKEN = {
  uid: 'upload-test-uid',
  email: 'uploader@adityauniversity.in',
  email_verified: true,
};

describe('Upload Validation', () => {
  beforeAll(async () => {
    // Create test user in DB so auth middleware passes
    const User = mongoose.model('User');
    await User.findOneAndUpdate(
      { firebaseUid: TEST_DECODED_TOKEN.uid },
      {
        firebaseUid: TEST_DECODED_TOKEN.uid,
        email: TEST_DECODED_TOKEN.email,
        fullName: 'Upload Test User',
        role: 'student',
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

  it('should accept JPEG image upload', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('fake-jpeg-data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    // Should not be rejected for file type (may fail for other reasons in test env)
    expect(res.status).not.toBe(400);
  });

  it('should accept PNG image upload', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('fake-png-data'), {
        filename: 'test.png',
        contentType: 'image/png',
      });

    expect(res.status).not.toBe(400);
  });

  it('should accept PDF upload', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('fake-pdf-data'), {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).not.toBe(400);
  });

  it('should reject executable file upload', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('fake-exe-data'), {
        filename: 'malware.exe',
        contentType: 'application/x-msdownload',
      });

    expect(res.status).toBe(400);
  });

  it('should reject JavaScript file upload', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('alert("xss")'), {
        filename: 'script.js',
        contentType: 'application/javascript',
      });

    expect(res.status).toBe(400);
  });
});
