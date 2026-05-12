/**
 * @file errorMiddleware.test.js — Unit tests for centralized error handler
 */

// Mock dependencies using relative paths from the test file
jest.mock('../../../src/config/env', () => ({
  NODE_ENV: 'development',
}));

jest.mock('../../../src/shared/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  debug: jest.fn(),
}));

const errorHandler = require('../../../src/middleware/error.middleware');

describe('error.middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  test('sends 500 for generic errors', () => {
    const err = new Error('Something broke');

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Something broke',
        statusCode: 500,
      })
    );
  });

  test('preserves custom statusCode from AppError', () => {
    const err = new Error('Not found');
    err.statusCode = 404;

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 })
    );
  });

  test('handles Mongoose ValidationError as 422', () => {
    const err = new Error();
    err.name = 'ValidationError';
    err.errors = {
      name: { message: 'Name is required' },
      email: { message: 'Email is invalid' },
    };

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
  });

  test('handles Mongoose CastError as 400', () => {
    const err = new Error();
    err.name = 'CastError';
    err.path = '_id';
    err.value = 'not-an-id';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid _id'),
      })
    );
  });

  test('handles duplicate key error (11000) as 409', () => {
    const err = new Error();
    err.code = 11000;
    err.keyValue = { email: 'test@test.com' };

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Duplicate value'),
      })
    );
  });

  test('handles JsonWebTokenError as 401', () => {
    const err = new Error('jwt malformed');
    err.name = 'JsonWebTokenError';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  test('handles TokenExpiredError as 401', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  test('handles JSON parse error as 400', () => {
    const err = new SyntaxError('Unexpected token');
    err.type = 'entity.parse.failed';

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test('includes stack trace in development', () => {
    const err = new Error('Dev error');

    errorHandler(err, mockReq, mockRes, mockNext);

    const response = mockRes.json.mock.calls[0][0];
    expect(response.stack).toBeDefined();
  });

  test('includes validation errors when present', () => {
    const err = new Error('Validation failed');
    err.statusCode = 422;
    err.validationErrors = [{ field: 'email', message: 'Required' }];

    errorHandler(err, mockReq, mockRes, mockNext);

    const response = mockRes.json.mock.calls[0][0];
    expect(response.errors).toEqual([{ field: 'email', message: 'Required' }]);
  });
});
