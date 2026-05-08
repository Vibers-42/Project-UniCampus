/**
 * @file users.controller.js — User Profile Request Handlers
 *
 * SCOPE: Internal to users/ — only users.routes.js imports this.
 * Thin layer: parses req → calls service → sends response.
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
 * GET /users/search — Search users by filters
 * Query params: department, skills (comma-separated), academicYear
 */
const searchUsers = catchAsync(async (req, res) => {
  const users = await usersService.searchUsers(req.query);
  sendSuccess(res, users, `Found ${users.length} users.`);
});

/**
 * GET /users/:email — View any user's public profile
 */
const getByEmail = catchAsync(async (req, res) => {
  const profile = await usersService.getProfile(req.params.email);

  if (!profile) {
    const err = new Error('User profile not found.');
    err.statusCode = 404;
    throw err;
  }

  sendSuccess(res, profile, 'User profile fetched.');
});

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getByEmail,
};
