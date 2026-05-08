/**
 * @file users.service.js — User Profile Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All profile-related business logic. No req/res objects.
 *
 * PUBLIC INTERFACE:
 *   getProfile(email)                    → profile document or null
 *   updateProfile(email, updateData)     → updated profile
 *   uploadAvatar(email, cloudinaryUrl)   → updated profile (URL only, never binary)
 *   searchUsers(filters)                 → array of matching profiles
 *
 * SCOPE:
 *   Public — may be called by other module services if needed.
 *
 * LINKING:
 *   Uses email as the key to find/create profiles. The email comes
 *   from the JWT payload (set by auth module during login).
 */

const UsersModel = require('./users.model');

/**
 * Get a user's profile by email.
 * If no profile exists yet, returns null (profile is created on first update).
 *
 * @param {string} email — User's email
 * @returns {Promise<Object|null>} Profile document or null
 */
const getProfile = async (email) => {
  return UsersModel.findOne({ email });
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
    'skills', 'bio', 'avatarUrl', 'githubUrl', 'portfolioUrl', 'college',
  ];

  const sanitized = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      sanitized[key] = updateData[key];
    }
  }

  // Check if profile should be marked as complete
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
 * Search users by filters.
 *
 * @param {Object} filters — Search criteria
 * @param {string} [filters.department] — Filter by department
 * @param {string} [filters.skills] — Comma-separated skills to match
 * @param {number} [filters.academicYear] — Filter by academic year
 * @returns {Promise<Array>} Matching profiles
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

  return UsersModel.find(query)
    .select('name email department academicYear skills bio avatarUrl college')
    .sort({ name: 1 })
    .limit(50);
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
};
