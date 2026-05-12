/**
 * @file apiResponse.test.js — Unit tests for response helper utilities
 */

const { sendSuccess, sendError } = require('../../../src/shared/responses/apiResponse');

describe('apiResponse helpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('sendSuccess', () => {
    test('sends 200 with correct shape by default', () => {
      sendSuccess(mockRes, { id: 1 }, 'Test message');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        statusCode: 200,
        data: { id: 1 },
        message: 'Test message',
      });
    });

    test('supports custom status code', () => {
      sendSuccess(mockRes, null, 'Created', 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        statusCode: 201,
        data: null,
        message: 'Created',
      });
    });

    test('uses default message when none provided', () => {
      sendSuccess(mockRes, []);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Success' })
      );
    });
  });

  describe('sendError', () => {
    test('sends 500 with error shape by default', () => {
      sendError(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        statusCode: 500,
        message: 'Something went wrong',
      });
    });

    test('supports custom error message and status', () => {
      sendError(mockRes, 'Not found', 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        statusCode: 404,
        message: 'Not found',
      });
    });
  });
});
