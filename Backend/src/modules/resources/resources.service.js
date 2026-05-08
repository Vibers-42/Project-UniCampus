/**
 * @file resources.service.js — Resources Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All resource-related business logic. No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   create(data, email)          → new resource document
 *   getAll(filters)              → { items, pagination }
 *   getById(id)                  → resource document
 *   upvote(id, email)            → resource with toggled upvote
 *   incrementDownload(id)        → updated download count
 *   remove(id, email)            → { message }
 *
 * PAGINATION:
 *   getAll() uses the shared pagination helper. Response shape:
 *   { items: [...], pagination: { page, limit, totalCount, totalPages } }
 *
 * TAG FILTERING:
 *   getAll() accepts ?tag= query param for tag-based filtering.
 *   Uses $in for case-insensitive match against the tags array.
 */

const Resource = require('./resources.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

/**
 * Create a new resource.
 *
 * @param {Object} data — Resource fields from the request body
 * @param {string} email — Uploader's email (from JWT)
 * @returns {Promise<Object>} Created resource document
 */
const create = async (data, email) => {
  // Normalize tags to lowercase for consistent filtering
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.map((t) => t.trim().toLowerCase());
  }

  return Resource.create({ ...data, uploadedBy: email });
};

/**
 * Get all resources with filtering and pagination.
 *
 * Supported filters:
 *   ?department=CS        — Filter by department
 *   ?semester=3           — Filter by semester
 *   ?subject=math         — Filter by subject (partial, case-insensitive)
 *   ?tag=midterm           — Filter by tag (exact match in tags array)
 *   ?resourceType=notes   — Filter by resource type
 *   ?search=calculus       — Full-text search across title, tags, subject
 *   ?page=1&limit=20      — Pagination
 *
 * @param {Object} filters — Query params
 * @returns {Promise<{ items: Array, pagination: Object }>}
 */
const getAll = async (filters = {}) => {
  const query = {};

  if (filters.department) {
    query.department = new RegExp(`^${filters.department}$`, 'i');
  }

  if (filters.semester) {
    query.semester = Number(filters.semester);
  }

  if (filters.subject) {
    query.subject = new RegExp(filters.subject, 'i');
  }

  if (filters.tag) {
    query.tags = { $in: [filters.tag.trim().toLowerCase()] };
  }

  if (filters.resourceType) {
    query.resourceType = filters.resourceType;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const { page, limit, skip } = parsePagination(filters);

  const [items, totalCount] = await Promise.all([
    Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-upvotes'), // Don't send full upvote array in list view
    Resource.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationResult(page, limit, totalCount),
  };
};

/**
 * Get a single resource by ID.
 *
 * @param {string} id — Resource MongoDB _id
 * @returns {Promise<Object>} Resource document
 * @throws {AppError} 404 if not found
 */
const getById = async (id) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  return resource;
};

/**
 * Toggle upvote on a resource.
 * If the user has already upvoted → remove their vote.
 * If the user hasn't upvoted → add their vote.
 *
 * @param {string} id — Resource MongoDB _id
 * @param {string} email — Voter's email (from JWT)
 * @returns {Promise<Object>} Updated resource
 * @throws {AppError} 404 if not found
 */
const upvote = async (id, email) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }

  const idx = resource.upvotes.indexOf(email);
  if (idx === -1) {
    resource.upvotes.push(email);
  } else {
    resource.upvotes.splice(idx, 1);
  }

  await resource.save();
  return resource;
};

/**
 * Increment the download count for a resource.
 *
 * @param {string} id — Resource MongoDB _id
 * @returns {Promise<Object>} Updated resource with incremented count
 * @throws {AppError} 404 if not found
 */
const incrementDownload = async (id) => {
  const resource = await Resource.findByIdAndUpdate(
    id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  return resource;
};

/**
 * Delete a resource (owner only).
 *
 * @param {string} id — Resource MongoDB _id
 * @param {string} email — Requester's email (must match uploadedBy)
 * @returns {Promise<{ message: string }>}
 * @throws {AppError} 404 if not found, 403 if not owner
 */
const remove = async (id, email) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  if (resource.uploadedBy !== email) {
    throw new AppError('You can only delete your own resources', 403);
  }

  await resource.deleteOne();
  return { message: 'Resource deleted successfully.' };
};

module.exports = {
  create,
  getAll,
  getById,
  upvote,
  incrementDownload,
  remove,
};
