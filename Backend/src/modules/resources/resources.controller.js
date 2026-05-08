/**
 * @file resources.controller.js — Resource Request Handlers
 *
 * SINGLE RESPONSIBILITY:
 *   Thin layer between routes and resources.service.js.
 *   Each function: parses req → calls service → sends response.
 *   No business logic. No direct DB calls.
 *
 * SCOPE:
 *   Internal to resources/ — only resources.routes.js imports this.
 *
 * PATTERNS:
 *   - Every function wrapped in catchAsync (no try/catch)
 *   - Every response uses sendSuccess (no raw res.json)
 *   - getAll() returns pagination metadata alongside items
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./resources.service');

/**
 * POST /resources
 * Upload a new academic resource.
 */
const create = catchAsync(async (req, res) => {
  const resource = await svc.create(req.body, req.user.email);
  sendSuccess(res, resource, 'Resource uploaded successfully', 201);
});

/**
 * GET /resources
 * List resources with filtering and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const { items, pagination } = await svc.getAll(req.query);
  sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} resources`);
});

/**
 * GET /resources/:id
 * Get a single resource by ID.
 */
const getById = catchAsync(async (req, res) => {
  const resource = await svc.getById(req.params.id);
  sendSuccess(res, resource, 'Resource fetched');
});

/**
 * PATCH /resources/:id/upvote
 * Toggle upvote on a resource.
 */
const upvote = catchAsync(async (req, res) => {
  const resource = await svc.upvote(req.params.id, req.user.email);
  sendSuccess(res, resource, 'Upvote toggled');
});

/**
 * PATCH /resources/:id/download
 * Increment download count for a resource.
 */
const download = catchAsync(async (req, res) => {
  const resource = await svc.incrementDownload(req.params.id);
  sendSuccess(res, { downloadCount: resource.downloadCount }, 'Download count updated');
});

/**
 * DELETE /resources/:id
 * Delete a resource (owner only).
 */
const remove = catchAsync(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user.email);
  sendSuccess(res, null, result.message);
});

module.exports = { create, getAll, getById, upvote, download, remove };
