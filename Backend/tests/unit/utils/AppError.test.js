/**
 * @file AppError.test.js — Unit tests for custom AppError class
 */

const AppError = require('../../../src/shared/utils/AppError');

describe('AppError', () => {
  test('creates error with message and status code', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err).toBeInstanceOf(Error);
  });

  test('statusCode is undefined if not provided', () => {
    const err = new AppError('Server error');
    expect(err.statusCode).toBeUndefined();
  });

  test('has a stack trace', () => {
    const err = new AppError('Test', 400);
    expect(err.stack).toBeDefined();
  });

  test('message is inherited from Error', () => {
    const err = new AppError('Custom message', 422);
    expect(err.message).toBe('Custom message');
    expect(err.name).toBe('Error'); // inherits Error name
  });
});
