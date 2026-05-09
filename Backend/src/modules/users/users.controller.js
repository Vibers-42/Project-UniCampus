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
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const usersService = require('./users.service');

/**
 * GET /users/profile — Get own profile
 * Uses req.user.email from protect middleware.
 */
const getProfile = catchAsync(async (req, res) => {
  const profile = await usersService.getProfile(req.user.email);

  if (!profile) {
    return sendSuccess(res, null, 'No profile found. Please log in to create one.');
  }

  sendSuccess(res, profile, 'Profile fetched successfully.');
});

/**
 * PATCH /users/profile — Update own profile
 * Only whitelisted fields are applied (enforced at service layer).
 * Immutable fields (firebaseUid, email, role, rollNumber, isVerified)
 * are silently ignored if sent.
 */
const updateProfile = catchAsync(async (req, res) => {
  const profile = await usersService.updateProfile(req.user.email, req.body);
  sendSuccess(res, profile, 'Profile updated successfully.');
});

/**
 * PATCH /users/avatar — Update avatar URL
 * Expects body: { avatar: "https://res.cloudinary.com/..." }
 */
const updateAvatar = catchAsync(async (req, res) => {
  const profile = await usersService.updateAvatar(req.user.email, req.body.avatar);
  sendSuccess(res, profile, 'Avatar updated successfully.');
});

/**
 * POST /users/onboarding — Complete onboarding
 * Accepts all onboarding fields. All optional. Sets onboardingCompleted = true.
 */
const completeOnboarding = catchAsync(async (req, res) => {
  const profile = await usersService.completeOnboarding(req.user.email, req.body);
  sendSuccess(res, profile, 'Onboarding completed successfully.');
});

/**
 * POST /users/onboarding/skip — Skip onboarding
 * Marks the user as having skipped onboarding. They can complete later.
 */
const skipOnboarding = catchAsync(async (req, res) => {
  const profile = await usersService.skipOnboarding(req.user.email);
  sendSuccess(res, profile, 'Onboarding skipped. You can complete it anytime from settings.');
});

/**
 * GET /users/search — Search users by filters with pagination
 * Query params: department, skills, yearOfStudy, availability, search, page, limit
 */
const searchUsers = catchAsync(async (req, res) => {
  const { items, pagination } = await usersService.searchUsers(req.query);
  sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} users.`);
});

/**
 * GET /users/:email — View any user's public profile
 * Excludes sensitive fields (firebaseUid, isVerified, etc.).
 * Throws 404 if not found (handled by service layer via AppError).
 */
const getByEmail = catchAsync(async (req, res) => {
  const profile = await usersService.getPublicProfile(req.params.email);
  sendSuccess(res, profile, 'User profile fetched.');
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  completeOnboarding,
  skipOnboarding,
  searchUsers,
  getByEmail,
};
