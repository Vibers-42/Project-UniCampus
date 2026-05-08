/**
 * @file users.controller.js — User Profile Request Handlers
 *
 * SINGLE RESPONSIBILITY:
 *   Thin layer between routes and users.service.js.
 *   Each function: parses req → calls service → sends response.
 *   No business logic. No direct DB calls.
 *
 * SCOPE:
 *   Internal to users/ — only users.routes.js imports this.
 *
 * PATTERNS:
 *   - Every function wrapped in catchAsync (no try/catch)
 *   - Every response uses sendSuccess (no raw res.json)
 *   - searchUsers() returns pagination metadata alongside items
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const usersService = require('./users.service');

/**
 * GET /users/profile — Get own profile
 * Uses req.user.email from JWT payload.
 */
const getProfile = catchAsync(async (req, res) => {
  const profile = await usersService.getProfile(req.user.email);

  if (!profile) {
    return sendSuccess(res, null, 'No profile found. Please update your profile to create one.');
  }

  sendSuccess(res, profile, 'Profile fetched successfully.');
});

/**
 * PATCH /users/profile — Update own profile
 * Creates the profile if it doesn't exist (upsert in service).
 */
const updateProfile = catchAsync(async (req, res) => {
  const profile = await usersService.updateProfile(req.user.email, req.body);
  sendSuccess(res, profile, 'Profile updated successfully.');
});

/**
 * GET /users/search — Search users by filters with pagination
 * Query params: department, skills (comma-separated), academicYear, college, search, page, limit
 */
const searchUsers = catchAsync(async (req, res) => {
  const { items, pagination } = await usersService.searchUsers(req.query);
  sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} users.`);
});

/**
 * GET /users/:email — View any user's public profile
 * Throws 404 if not found (handled by service layer via AppError).
 */
const getByEmail = catchAsync(async (req, res) => {
  const profile = await usersService.getPublicProfile(req.params.email);
  sendSuccess(res, profile, 'User profile fetched.');
});

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getByEmail,
};
