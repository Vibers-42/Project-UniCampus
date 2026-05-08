/**
 * @file users.service.js — User Profile Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All profile-related business logic. No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   getProfile(email)                    → profile document or null
 *   getPublicProfile(email)             → profile (throws 404 if not found)
 *   updateProfile(email, updateData)     → updated profile
 *   uploadAvatar(email, cloudinaryUrl)   → updated profile (URL only, never binary)
 *   searchUsers(filters)                 → { items, pagination }
 *
 * SCOPE:
 *   Public — may be called by other module services if needed.
 *   This is one of only two files importable outside users/ (along with routes).
 *
 * IDENTITY CONTRACT:
 *   Uses email as the key to find/create profiles. The email comes
 *   from the JWT payload (set by auth module during login).
 *   Other modules can call getProfile(email) or getPublicProfile(email)
 *   to resolve user identity without importing the model directly.
 */

const UsersModel = require('./users.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

/**
 * Get a user's own profile by email.
 * If no profile exists yet, returns null (profile is created on first update).
 *
 * @param {string} email — User's email
 * @returns {Promise<Object|null>} Profile document or null
 */
const getProfile = async (email) => {
  return UsersModel.findOne({ email });
};

/**
 * Get a user's public profile by email.
 * Throws 404 if not found (used for viewing other users' profiles).
 *
 * @param {string} email — Target user's email
 * @returns {Promise<Object>} Profile document
 * @throws {AppError} 404 if profile not found
 */
const getPublicProfile = async (email) => {
  const profile = await UsersModel.findOne({ email });
  if (!profile) {
    throw new AppError('User profile not found.', 404);
  }
  return profile;
};

/**
 * Update a user's profile. Creates the profile if it doesn't exist (upsert).
 *
 * WHY UPSERT:
 *   After auth registration, the user has an auth record but no profile.
 *   The first PATCH /profile call creates the profile automatically.
 *   No separate "create profile" step needed.
 *
 * SANITIZATION:
 *   Only whitelisted fields are applied. Any extra fields in updateData
 *   are silently ignored (prevents mass-assignment attacks).
 *
 * @param {string} email — User's email
 * @param {Object} updateData — Fields to update
 * @returns {Promise<Object>} Updated profile document
 */
const updateProfile = async (email, updateData) => {
  // Whitelist — only these fields can be updated by the user
  const allowed = [
    'name', 'department', 'academicYear', 'semester',
    'skills', 'bio', 'avatarUrl', 'githubUrl', 'linkedinUrl',
    'portfolioUrl', 'college',
  ];

  const sanitized = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      sanitized[key] = updateData[key];
    }
  }

  // Normalize skills to lowercase for consistent matching
  // (same pattern as tags in resources and events modules)
  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills.map((s) => s.trim().toLowerCase());
  }

  // Upsert: create if not exists, update if exists
  const profile = await UsersModel.findOneAndUpdate(
    { email },
    { $set: { ...sanitized, email } },
    { new: true, upsert: true, runValidators: true }
  );

  // Auto-detect profile completeness
  const isComplete = !!(profile.name && profile.department && profile.academicYear);
  if (profile.isProfileComplete !== isComplete) {
    profile.isProfileComplete = isComplete;
    await profile.save();
  }

  return profile;
};

/**
 * Update a user's avatar URL.
 *
 * ARCHITECTURE NOTE:
 *   This receives a Cloudinary URL string — NEVER a file buffer.
 *   The frontend uploads the image directly to Cloudinary and sends
 *   the resulting URL to this endpoint.
 *
 * @param {string} email — User's email
 * @param {string} cloudinaryUrl — The Cloudinary URL for the uploaded avatar
 * @returns {Promise<Object>} Updated profile document
 */
const uploadAvatar = async (email, cloudinaryUrl) => {
  return UsersModel.findOneAndUpdate(
    { email },
    { $set: { avatarUrl: cloudinaryUrl, email } },
    { new: true, upsert: true, runValidators: true }
  );
};

/**
 * Search users with filtering and pagination.
 *
 * Supported filters:
 *   ?department=CS              — Filter by department (partial, case-insensitive)
 *   ?skills=react,node          — Filter by skills (comma-separated, any match)
 *   ?academicYear=3             — Filter by academic year
 *   ?college=MIT                — Filter by college (partial, case-insensitive)
 *   ?search=john                — Full-text search across name, skills, department
 *   ?page=1&limit=20            — Pagination
 *
 * @param {Object} filters — Query params
 * @returns {Promise<{ items: Array, pagination: Object }>}
 */
const searchUsers = async (filters = {}) => {
  const query = {};

  if (filters.department) {
    query.department = new RegExp(filters.department, 'i');
  }

  if (filters.skills) {
    // Accept comma-separated skills: "react,node,python"
    const skillsList = filters.skills.split(',').map((s) => s.trim().toLowerCase());
    query.skills = { $in: skillsList };
  }

  if (filters.academicYear) {
    query.academicYear = Number(filters.academicYear);
  }

  if (filters.college) {
    query.college = new RegExp(filters.college, 'i');
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const { page, limit, skip } = parsePagination(filters);

  const [items, totalCount] = await Promise.all([
    UsersModel.find(query)
      .select('name email department academicYear skills bio avatarUrl college isProfileComplete')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    UsersModel.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationResult(page, limit, totalCount),
  };
};

module.exports = {
  getProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
};
