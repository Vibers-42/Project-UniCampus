/**
 * @file resources.controller.js — Resource Request Handlers
 *
 * SINGLE RESPONSIBILITY:
 *   Thin layer between routes and resources.service.js.
 *   Each function: parses req → calls service → sends response.
 *   No business logic. No direct DB calls.
 *
 * PATTERNS:
 *   - Every function wrapped in catchAsync (no try/catch)
 *   - Every response uses sendSuccess (no raw res.json)
 *   - Socket.io io instance is accessed via req.app.get('io')
 *
 * DUPLICATE HANDLING:
 *   create() catches the 409 AppError from service and returns
 *   the existing resource info so the client can link to it.
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const AppError = require('../../shared/utils/AppError');
const svc = require('./resources.service');

/**
 * GET /resources
 * List resources with filters, sort, and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const result = await svc.getAll(req.query);
  sendSuccess(res, result, `Found ${result.totalCount} resources`);
});

/**
 * GET /resources/subjects
 * Get subjects list for a department+semester (autocomplete).
 */
const getSubjects = catchAsync(async (req, res) => {
  const { department, semester } = req.query;
  if (!department || !semester) {
    throw new AppError('department and semester query params are required', 400);
  }
  const subjects = await svc.getSubjects(department, semester);
  sendSuccess(res, { subjects }, 'Subjects fetched');
});

/**
 * POST /resources
 * Upload a new academic resource (multipart/form-data).
 */
const create = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('File is required. Please upload a PDF, DOC, or image.', 400);
  }

  const io = req.app.get('io');

  try {
    const resource = await svc.create(
      req.file.buffer,
      req.file.mimetype,
      req.body,
      req.user.id,
      io
    );
    sendSuccess(res, resource, 'Resource uploaded successfully', 201);
  } catch (err) {
    // Handle 409 duplicate — return existing resource info
    if (err.statusCode === 409 && err.existingResource) {
      return res.status(409).json({
        success: false,
        message: err.message,
        existingResource: err.existingResource,
      });
    }
    throw err;
  }
});

/**
 * GET /resources/:id
 * Get a single resource by ID with populated uploader.
 */
const getById = catchAsync(async (req, res) => {
  const resource = await svc.getById(req.params.id);
  sendSuccess(res, resource, 'Resource fetched');
});

/**
 * POST /resources/:id/vote
 * Toggle upvote on a resource.
 */
const vote = catchAsync(async (req, res) => {
  const io = req.app.get('io');
  const resource = await svc.vote(req.params.id, req.user.id, io);
  sendSuccess(res, { upvoteCount: resource.upvotes.length }, 'Vote toggled');
});

/**
 * POST /resources/:id/rate
 * Rate a resource (1–5). One rating per user.
 */
const rate = catchAsync(async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be a number between 1 and 5', 400);
  }
  const resource = await svc.rate(req.params.id, req.user.id, Number(rating));
  sendSuccess(res, { qualityRating: resource.qualityRating, ratingCount: resource.ratingCount }, 'Rating submitted');
});

/**
 * POST /resources/:id/download
 * Increment download count and return the download URL.
 */
const download = catchAsync(async (req, res) => {
  const io = req.app.get('io');
  const result = await svc.incrementDownload(req.params.id, req.user.id, io);
  sendSuccess(res, result, 'Download counted');
});

/**
 * DELETE /resources/:id
 * Delete a resource (owner or admin only).
 */
const remove = catchAsync(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, result, 'Resource deleted successfully');
});

module.exports = { getAll, getSubjects, create, getById, vote, rate, download, remove };
