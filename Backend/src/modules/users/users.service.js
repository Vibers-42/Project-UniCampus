/**
 * @file users.service.js — User Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All user-related business logic. No req/res objects — pure logic.
 *   This is the PUBLIC interface for user data — other modules call
 *   these functions rather than importing the model directly.
 *
 * PUBLIC INTERFACE:
 *   ── Auth-related (called by auth module) ──
 *   findByFirebaseUid(uid)                  → user document or null
 *   findOrCreateFromFirebase(uid, email)    → user document (upsert)
 *   updateLastLogin(userId)                 → updated user
 *   findById(userId)                        → user document or null
 *
 *   ── Lookup methods ──
 *   findByEmail(email)                      → user document or null
 *   findByRollNumber(rollNumber)            → user document or null
 *
 *   ── Profile methods (called by users controller) ──
 *   getProfile(email)                       → user document or null
 *   getPublicProfile(email)                 → user (throws 404 if not found)
 *   updateProfile(email, updateData)        → updated user
 *   updateAvatar(email, cloudinaryUrl)      → updated user
 *   searchUsers(filters)                    → { items, pagination }
 *
 *   ── Onboarding methods ──
 *   completeOnboarding(email, data)         → updated user
 *   skipOnboarding(email)                   → updated user
 *
 *   ── Computed methods ──
 *   computeProfileCompletion(user)          → number (0–100)
 *
 * CROSS-MODULE USAGE:
 *   auth.service.js calls findByFirebaseUid() and findOrCreateFromFirebase().
 *   This is the intended cross-module pattern: service → service, never
 *   importing the model directly from outside the module.
 *
 * IMMUTABLE FIELDS (never updatable through updateProfile):
 *   firebaseUid, email, role, rollNumber, isVerified
 */

const User = require('./users.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

// ──────────────────────────────────────────
// PROFILE COMPLETION FIELDS
// ──────────────────────────────────────────
// These fields are counted toward profileCompletionPercent.
// Adding a field here automatically updates the percentage calculation.

const PROFILE_COMPLETION_FIELDS = [
  'bio',
  'skills',
  'interests',
  'techStack',
  'rolesPreferred',
  'availability',
  'github',
  'portfolio',
  'avatar',
];

// ──────────────────────────────────────────
// AUTH-RELATED METHODS (called by auth module)
// ──────────────────────────────────────────

/**
 * Find a user by their Firebase UID.
 * Called by auth middleware on every authenticated request to populate req.user.
 *
 * @param {string} firebaseUid — Firebase Auth UID
 * @returns {Promise<Object|null>} User document or null
 */
const findByFirebaseUid = async (firebaseUid) => {
  return User.findOne({ firebaseUid });
};

/**
 * Find an existing user or create a new one from Firebase credentials.
 * Called by auth.service.js during the /auth/sync flow.
 *
 * IDEMPOTENCY:
 *   Multiple identical sync requests MUST NOT create duplicate users.
 *   - First lookup is by firebaseUid (unique, indexed)
 *   - If not found, a new record is created with the provided metadata
 *   - If a race condition causes a duplicate key error (E11000),
 *     we catch it and re-fetch the existing record instead of crashing
 *
 * @param {string} firebaseUid — Firebase Auth UID
 * @param {string} email — User's email (already verified by Firebase)
 * @param {Object} [metadata] — Optional registration data for first-time users
 * @param {string} [metadata.fullName]
 * @param {string} [metadata.rollNumber]
 * @param {string} [metadata.department]
 * @param {number} [metadata.yearOfStudy]
 * @returns {Promise<{ user: Object, isNewUser: boolean }>}
 */
const findOrCreateFromFirebase = async (firebaseUid, email, metadata = {}) => {
  // 1. Try to find existing user (fastest path — indexed lookup)
  let user = await User.findOne({ firebaseUid });

  if (user) {
    return { user, isNewUser: false };
  }

  // 2. New user — build the document with provided metadata
  const newUserData = {
    firebaseUid,
    email: email.toLowerCase(),
    role: 'student',
    isVerified: true, // Firebase has already verified the email
  };

  // Apply optional registration metadata if provided
  if (metadata.fullName) newUserData.fullName = metadata.fullName;
  if (metadata.rollNumber) newUserData.rollNumber = metadata.rollNumber.toUpperCase();
  if (metadata.department) newUserData.department = metadata.department;
  if (metadata.yearOfStudy) newUserData.yearOfStudy = Number(metadata.yearOfStudy);

  try {
    user = await User.create(newUserData);
    return { user, isNewUser: true };
  } catch (error) {
    // Handle race condition: concurrent sync requests for the same user.
    // MongoDB's unique index on firebaseUid or email may throw E11000.
    // Instead of crashing, re-fetch the existing record.
    if (error.code === 11000) {
      user = await User.findOne({ firebaseUid });
      if (user) {
        return { user, isNewUser: false };
      }
      // If still not found by firebaseUid, try by email
      // (edge case: same email registered under a different firebaseUid)
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        throw new AppError(
          'An account with this email already exists under a different identity.',
          409
        );
      }
    }
    // Re-throw any other error
    throw error;
  }
};

/**
 * Update the user's lastLogin timestamp.
 *
 * @param {string} userId — MongoDB _id
 * @returns {Promise<Object>} Updated user document
 */
const updateLastLogin = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    { lastLogin: new Date() },
    { new: true }
  );
};

/**
 * Find a user by their MongoDB _id.
 * Called by auth.service.js to fetch the full user profile for /auth/me.
 *
 * @param {string} userId — MongoDB _id
 * @returns {Promise<Object|null>} User document or null
 */
const findById = async (userId) => {
  return User.findById(userId);
};

// ──────────────────────────────────────────
// LOOKUP METHODS
// ──────────────────────────────────────────

/**
 * Find a user by email.
 *
 * @param {string} email — User's email
 * @returns {Promise<Object|null>} User document or null
 */
const findByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

/**
 * Find a user by roll number.
 *
 * @param {string} rollNumber — Student roll number
 * @returns {Promise<Object|null>} User document or null
 */
const findByRollNumber = async (rollNumber) => {
  return User.findOne({ rollNumber: rollNumber.toUpperCase() });
};

// ──────────────────────────────────────────
// PROFILE METHODS (called by users controller)
// ──────────────────────────────────────────

/**
 * Get a user's own profile by email.
 * Returns null if no profile exists (shouldn't happen after login sync).
 *
 * @param {string} email — User's email
 * @returns {Promise<Object|null>} User document or null
 */
const getProfile = async (email) => {
  return User.findOne({ email });
};

/**
 * Get a user's public profile by email.
 * Throws 404 if not found (used for viewing other users' profiles).
 * Excludes sensitive fields from the response.
 *
 * @param {string} email — Target user's email
 * @returns {Promise<Object>} User document (public fields only)
 * @throws {AppError} 404 if user not found
 */
const getPublicProfile = async (email) => {
  const user = await User.findOne({ email })
    .select('-firebaseUid -isVerified -isActive -onboardingSkipped -lastLogin');

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }
  return user;
};

/**
 * Update a user's profile.
 *
 * SANITIZATION:
 *   Only whitelisted fields are applied. Any extra fields in updateData
 *   are silently ignored (prevents mass-assignment attacks).
 *
 * IMMUTABLE FIELDS (NEVER updatable through this method):
 *   firebaseUid, email, role, rollNumber, isVerified
 *
 * @param {string} email — User's email
 * @param {Object} updateData — Fields to update
 * @returns {Promise<Object>} Updated user document
 * @throws {AppError} 404 if user not found
 */
const updateProfile = async (email, updateData) => {
  // Whitelist — only these fields can be updated by the user
  const allowed = [
    'fullName', 'department', 'yearOfStudy',
    'bio', 'tagline', 'skills', 'interests', 'techStack',
    'rolesPreferred', 'availability',
    'github', 'linkedin', 'portfolio', 'twitter',
  ];

  const sanitized = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      sanitized[key] = updateData[key];
    }
  }

  // Normalize array fields to lowercase for consistent matching
  const arrayFields = ['skills', 'interests', 'techStack', 'rolesPreferred'];
  for (const field of arrayFields) {
    if (sanitized[field] && Array.isArray(sanitized[field])) {
      sanitized[field] = sanitized[field].map((s) => s.trim().toLowerCase());
    }
  }

  const user = await User.findOneAndUpdate(
    { email },
    { $set: sanitized },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Recompute and persist profile completion percentage
  const percent = computeProfileCompletion(user);
  if (user.profileCompletionPercent !== percent) {
    user.profileCompletionPercent = percent;
    await user.save();
  }

  return user;
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
 * @returns {Promise<Object>} Updated user document
 * @throws {AppError} 404 if user not found
 */
const updateAvatar = async (email, cloudinaryUrl) => {
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { avatar: cloudinaryUrl } },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Recompute profile completion (avatar is one of the tracked fields)
  const percent = computeProfileCompletion(user);
  if (user.profileCompletionPercent !== percent) {
    user.profileCompletionPercent = percent;
    await user.save();
  }

  return user;
};

/**
 * Search users with filtering and pagination.
 *
 * Supported filters:
 *   ?department=CS              — Filter by department (partial, case-insensitive)
 *   ?skills=react,node          — Filter by skills (comma-separated, any match)
 *   ?yearOfStudy=3              — Filter by year of study
 *   ?availability=available     — Filter by availability status
 *   ?search=john                — Full-text search across fullName, skills, department
 *   ?page=1&limit=20            — Pagination
 *
 * @param {Object} filters — Query params
 * @returns {Promise<{ items: Array, pagination: Object }>}
 */
const searchUsers = async (filters = {}) => {
  const query = { isActive: true }; // Only return active users

  if (filters.department) {
    query.department = new RegExp(filters.department, 'i');
  }

  if (filters.skills) {
    const skillsList = filters.skills.split(',').map((s) => s.trim().toLowerCase());
    query.skills = { $in: skillsList };
  }

  if (filters.yearOfStudy) {
    query.yearOfStudy = Number(filters.yearOfStudy);
  }

  if (filters.availability) {
    query.availability = filters.availability;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const { page, limit, skip } = parsePagination(filters);

  const [items, totalCount] = await Promise.all([
    User.find(query)
      .select('fullName email department yearOfStudy skills bio avatar availability profileCompletionPercent')
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationResult(page, limit, totalCount),
  };
};

// ──────────────────────────────────────────
// ONBOARDING METHODS
// ──────────────────────────────────────────

/**
 * Complete onboarding — update profile fields provided during onboarding.
 *
 * ALL fields are optional. Users can complete partial onboarding.
 * This sets onboardingCompleted = true and clears onboardingSkipped.
 *
 * SPECIAL: rollNumber can only be set during onboarding (not via updateProfile).
 * Once set, it becomes immutable.
 *
 * @param {string} email — User's email
 * @param {Object} data — Onboarding fields
 * @returns {Promise<Object>} Updated user document
 * @throws {AppError} 404 if user not found, 409 if rollNumber taken
 */
const completeOnboarding = async (email, data) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Allowed onboarding fields
  const allowed = [
    'fullName', 'rollNumber', 'department', 'yearOfStudy',
    'bio', 'skills', 'interests', 'techStack',
    'rolesPreferred', 'availability',
    'github', 'linkedin', 'portfolio',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      // rollNumber: only set if not already set (immutable once assigned)
      if (key === 'rollNumber') {
        if (user.rollNumber && user.rollNumber !== data[key].toUpperCase()) {
          throw new AppError('Roll number cannot be changed once set.', 400);
        }
        user[key] = data[key].toUpperCase();
      } else {
        user[key] = data[key];
      }
    }
  }

  // Normalize array fields
  const arrayFields = ['skills', 'interests', 'techStack', 'rolesPreferred'];
  for (const field of arrayFields) {
    if (Array.isArray(user[field])) {
      user[field] = user[field].map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : s));
    }
  }

  user.onboardingCompleted = true;
  user.onboardingSkipped = false;
  user.profileCompletionPercent = computeProfileCompletion(user);

  await user.save();
  return user;
};

/**
 * Skip onboarding — marks the user as having skipped the onboarding flow.
 * They can complete it later from their profile settings.
 *
 * @param {string} email — User's email
 * @returns {Promise<Object>} Updated user document
 * @throws {AppError} 404 if user not found
 */
const skipOnboarding = async (email) => {
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        onboardingSkipped: true,
        // Don't set onboardingCompleted — they skipped, not completed
      },
    },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

// ──────────────────────────────────────────
// COMPUTED METHODS
// ──────────────────────────────────────────

/**
 * Compute profile completion percentage.
 *
 * Counts how many of the PROFILE_COMPLETION_FIELDS are populated.
 * A field is "populated" if it's a truthy non-empty value:
 *   - Strings: length > 0
 *   - Arrays: length > 0
 *
 * @param {Object} user — User document (or plain object with user fields)
 * @returns {number} 0–100 (rounded to nearest integer)
 */
const computeProfileCompletion = (user) => {
  if (!user) return 0;

  let filled = 0;
  const total = PROFILE_COMPLETION_FIELDS.length;

  for (const field of PROFILE_COMPLETION_FIELDS) {
    const value = user[field];
    if (Array.isArray(value) && value.length > 0) {
      filled++;
    } else if (typeof value === 'string' && value.trim().length > 0) {
      filled++;
    }
  }

  return Math.round((filled / total) * 100);
};

module.exports = {
  // Auth-related
  findByFirebaseUid,
  findOrCreateFromFirebase,
  updateLastLogin,
  findById,

  // Lookups
  findByEmail,
  findByRollNumber,

  // Profile
  getProfile,
  getPublicProfile,
  updateProfile,
  updateAvatar,
  searchUsers,

  // Onboarding
  completeOnboarding,
  skipOnboarding,

  // Computed
  computeProfileCompletion,
};
