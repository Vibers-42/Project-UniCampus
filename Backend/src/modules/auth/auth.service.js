/**
 * @file auth.service.js — Auth Sync Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   Orchestrates Firebase identity synchronization with MongoDB user records.
 *   No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   syncUser(firebaseUid, email, metadata)  → { user, isNewUser }
 *   getCurrentUser(userId)                  → { user }
 *
 * WHAT FIREBASE HANDLES (NOT this service):
 *   - Email/password signup (createUserWithEmailAndPassword)
 *   - Email verification (sendEmailVerification)
 *   - Password reset (sendPasswordResetEmail)
 *   - Session persistence (onAuthStateChanged)
 *   - Token refresh (automatic, client-side)
 *
 * WHAT THIS SERVICE HANDLES:
 *   - Syncing Firebase identity → MongoDB user record
 *   - Creating new MongoDB records on first sync (with metadata)
 *   - Returning existing records on subsequent syncs (idempotent)
 *   - Updating lastLogin timestamp
 *   - Domain enforcement (@adityauniversity.in)
 *   - Returning user + onboarding state to the controller
 *
 * IDEMPOTENCY GUARANTEE:
 *   POST /auth/sync is fully idempotent. Multiple identical requests:
 *     - Never create duplicate users
 *     - Safely return the same user record
 *     - Handle race conditions via MongoDB unique constraints + retry
 *
 * DEPENDENCY RULES:
 *   This service imports ONLY:
 *     - users.service.js (cross-module, allowed by architecture rules)
 *     - shared/utils/AppError.js
 *     - shared/utils/logger.js
 *   It NEVER imports any model directly.
 *   It NEVER imports from any other business module.
 */

const usersService = require('../users/users.service');
const AppError = require('../../shared/utils/AppError');
const logger = require('../../shared/utils/logger');
const { ALLOWED_DOMAIN } = require('../../config/env');


/**
 * Validate that an email belongs to the allowed institutional domain.
 *
 * @param {string} email — Email to validate
 * @throws {AppError} 403 if domain is not allowed
 */
const validateEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain !== ALLOWED_DOMAIN) {
    throw new AppError(
      `Only @${ALLOWED_DOMAIN} email addresses are allowed on UniCampus.`,
      403
    );
  }
};

/**
 * Sync a Firebase user with MongoDB.
 *
 * Called after the verifyFirebaseToken middleware has verified the
 * Firebase ID token and populated req.firebaseUser.
 *
 * CASE A — EXISTING USER:
 *   If a MongoDB user with this firebaseUid exists:
 *     - Update lastLogin timestamp
 *     - Return existing user profile + onboarding state
 *     - Metadata in request body is IGNORED (no accidental overwrites)
 *
 * CASE B — FIRST-TIME USER:
 *   If no MongoDB user exists:
 *     - Validate required metadata (fullName, rollNumber, department, yearOfStudy)
 *     - Create new MongoDB user with metadata
 *     - Set isVerified = true (Firebase already verified the email)
 *     - Return new user + onboarding state
 *
 * IDEMPOTENCY:
 *   If two identical sync requests arrive concurrently:
 *     - MongoDB unique constraints prevent duplicates
 *     - E11000 errors are caught and retried as lookups
 *     - Both requests return the same user record
 *
 * @param {string} firebaseUid — Firebase Auth UID (from verified token)
 * @param {string} email — User's email (from verified token, lowercase)
 * @param {Object} [metadata] — Registration data (used ONLY for first-time users)
 * @param {string} [metadata.fullName]
 * @param {string} [metadata.rollNumber]
 * @param {string} [metadata.department]
 * @param {number} [metadata.yearOfStudy]
 * @returns {Promise<{ user: Object, isNewUser: boolean }>}
 */
const syncUser = async (firebaseUid, email, metadata = {}) => {
  // 1. Domain enforcement (defense in depth — middleware also checks)
  validateEmailDomain(email);

  // 2. Find existing user or create new one
  const { user, isNewUser } = await usersService.findOrCreateFromFirebase(
    firebaseUid,
    email,
    metadata
  );

  // 3. Update lastLogin
  await usersService.updateLastLogin(user._id);

  if (isNewUser) {
    logger.info(`New user synced: ${email}`);
  } else {
    logger.info(`Existing user synced: ${email}`);
  }

  // 4. Return user data + state for frontend routing decisions
  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      rollNumber: user.rollNumber,
      department: user.department,
      yearOfStudy: user.yearOfStudy,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      techStack: user.techStack,
      onboardingCompleted: user.onboardingCompleted,
      onboardingSkipped: user.onboardingSkipped,
      profileCompletionPercent: user.profileCompletionPercent,
    },
    isNewUser,
  };
};

/**
 * Get the current authenticated user's full data.
 * Called by GET /auth/me — returns all profile fields.
 *
 * This is the primary "session check" endpoint. The frontend calls
 * this on app load to determine:
 *   - Is the user authenticated?
 *   - Should they be sent to onboarding or dashboard?
 *   - What's their current profile state?
 *
 * @param {string} userId — MongoDB _id (from req.user.id)
 * @returns {Promise<{ user: Object }>}
 * @throws {AppError} 404 if user not found
 */
const getCurrentUser = async (userId) => {
  const user = await usersService.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      rollNumber: user.rollNumber,
      department: user.department,
      yearOfStudy: user.yearOfStudy,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      techStack: user.techStack,
      rolesPreferred: user.rolesPreferred,
      availability: user.availability,
      avatar: user.avatar,
      github: user.github,
      linkedin: user.linkedin,
      portfolio: user.portfolio,
      onboardingCompleted: user.onboardingCompleted,
      onboardingSkipped: user.onboardingSkipped,
      profileCompletionPercent: user.profileCompletionPercent,
      reputationScore: user.reputationScore,
      badges: user.badges,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  };
};

module.exports = {
  syncUser,
  getCurrentUser,
};
