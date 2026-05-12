/**
 * @file catchAsync.test.js — Unit tests for async wrapper middleware
 */

const catchAsync = require('../../../src/middleware/catchAsync');

describe('catchAsync middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  test('calls the wrapped function with req, res, next', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = catchAsync(handler);

    await wrapped(mockReq, mockRes, mockNext);

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  test('forwards errors to next() on rejected promise', async () => {
    const error = new Error('Test error');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = catchAsync(handler);

    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('forwards synchronously thrown errors to next()', async () => {
    const error = new Error('Thrown error');
    const handler = jest.fn().mockImplementation(async () => { throw error; });
    const wrapped = catchAsync(handler);

    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('does NOT call next() on success', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = catchAsync(handler);

    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });
});
