/**
 * @file pagination.js — Shared Pagination Helper
 *
 * SINGLE RESPONSIBILITY:
 *   Parses page/limit from query params and returns a standardized
 *   pagination object. Every service's getAll() uses this for consistent
 *   pagination behavior across all modules.
 *
 * RESPONSE SHAPE (returned by buildPaginationResult):
 *   {
 *     page: 1,
 *     limit: 20,
 *     totalCount: 120,
 *     totalPages: 6
 *   }
 *
 * USAGE:
 *   const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');
 *
 *   // In a service:
 *   const { page, limit, skip } = parsePagination(filters);
 *   const [items, totalCount] = await Promise.all([
 *     Model.find(query).skip(skip).limit(limit),
 *     Model.countDocuments(query),
 *   ]);
 *   return { items, pagination: buildPaginationResult(page, limit, totalCount) };
 */

/**
 * Parse pagination params from a query/filters object.
 *
 * @param {Object} query — Typically req.query or a filters object
 * @param {number} [query.page=1]   — Page number (1-indexed)
 * @param {number} [query.limit=20] — Items per page (capped at 50)
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a standardized pagination result object.
 *
 * @param {number} page       — Current page number
 * @param {number} limit      — Items per page
 * @param {number} totalCount — Total matching documents
 * @returns {{ page: number, limit: number, totalCount: number, totalPages: number }}
 */
const buildPaginationResult = (page, limit, totalCount) => ({
  page,
  limit,
  totalCount,
  totalPages: Math.ceil(totalCount / limit),
});

module.exports = {
  parsePagination,
  buildPaginationResult,
};
