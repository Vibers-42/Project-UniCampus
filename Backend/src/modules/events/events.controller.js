/**
 * @file events.controller.js — Event Request Handlers
 *
 * SINGLE RESPONSIBILITY:
 *   Thin layer between routes and events.service.js.
 *   Each function: parses req → calls service → sends response.
 *   No business logic. No direct DB calls.
 *
 * SCOPE:
 *   Internal to events/ — only events.routes.js imports this.
 *
 * PATTERNS:
 *   - Every function wrapped in catchAsync (no try/catch)
 *   - Every response uses sendSuccess (no raw res.json)
 *   - getAll() returns pagination metadata alongside items
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./events.service');

/**
 * POST /events
 * Create a new campus event.
 */
const create = catchAsync(async (req, res) => {
  const event = await svc.create(req.body, req.user.email);
  sendSuccess(res, event, 'Event created successfully', 201);
});

/**
 * GET /events
 * List events with filtering and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const { items, pagination } = await svc.getAll(req.query);
  sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} events`);
});

/**
 * GET /events/:id
 * Get a single event by ID (includes full RSVP list).
 */
const getById = catchAsync(async (req, res) => {
  const event = await svc.getById(req.params.id);
  sendSuccess(res, event, 'Event fetched');
});

/**
 * PATCH /events/:id
 * Update an event (organiser only).
 */
const update = catchAsync(async (req, res) => {
  const event = await svc.update(req.params.id, req.body, req.user.email);
  sendSuccess(res, event, 'Event updated successfully');
});

/**
 * POST /events/:id/rsvp
 * Toggle RSVP on an event.
 */
const rsvp = catchAsync(async (req, res) => {
  const { event, action } = await svc.rsvp(req.params.id, req.user.email);
  const message = action === 'confirmed' ? 'RSVP confirmed' : 'RSVP cancelled';
  sendSuccess(res, { event, action }, message);
});

/**
 * DELETE /events/:id
 * Delete an event (organiser only).
 */
const remove = catchAsync(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user.email);
  sendSuccess(res, null, result.message);
});

module.exports = { create, getAll, getById, update, rsvp, remove };
