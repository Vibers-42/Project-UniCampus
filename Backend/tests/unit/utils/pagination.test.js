/**
 * @file pagination.test.js — Unit tests for pagination utility
 */

const { parsePagination, buildPaginationResult } = require('../../../src/shared/utils/pagination');

describe('pagination utility', () => {
  describe('parsePagination', () => {
    test('returns defaults when no query provided', () => {
      const result = parsePagination();
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    test('returns defaults for empty object', () => {
      const result = parsePagination({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    test('parses page and limit from strings', () => {
      const result = parsePagination({ page: '3', limit: '10' });
      expect(result).toEqual({ page: 3, limit: 10, skip: 20 });
    });

    test('caps limit at 50', () => {
      const result = parsePagination({ limit: '100' });
      expect(result.limit).toBe(50);
    });

    test('enforces minimum page of 1', () => {
      const result = parsePagination({ page: '-1' });
      expect(result.page).toBe(1);
    });

    test('uses default limit when 0 is provided', () => {
      // parseInt('0') || 20 = 20 (falsy 0 triggers default)
      const result = parsePagination({ limit: '0' });
      expect(result.limit).toBe(20);
    });

    test('computes correct skip for page 2', () => {
      const result = parsePagination({ page: '2', limit: '15' });
      expect(result.skip).toBe(15);
    });
  });

  describe('buildPaginationResult', () => {
    test('computes totalPages correctly', () => {
      const result = buildPaginationResult(1, 10, 45);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        totalCount: 45,
        totalPages: 5,
      });
    });

    test('handles zero total count', () => {
      const result = buildPaginationResult(1, 20, 0);
      expect(result.totalPages).toBe(0);
    });

    test('handles exact page boundary', () => {
      const result = buildPaginationResult(2, 10, 20);
      expect(result.totalPages).toBe(2);
    });
  });
});
