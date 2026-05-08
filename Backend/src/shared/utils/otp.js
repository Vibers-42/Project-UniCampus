/**
 * @file otp.js — OTP Generation & Verification Helpers
 *
 * SINGLE RESPONSIBILITY:
 *   Generates cryptographically secure random 6-digit OTPs, hashes them
 *   with bcrypt for safe storage, and verifies user-submitted OTPs against
 *   stored hashes.
 *
 * EXPORTS:
 *   generateOTP()           — Returns a 6-digit numeric string (CSPRNG)
 *   hashOTP(otp)            — Returns a bcrypt hash of the OTP
 *   verifyOTP(otp, hash)    — Returns true if the OTP matches the hash
 *
 * SECURITY RULES:
 *   - OTPs are NEVER stored in plain text in the database.
 *   - OTPs are generated using crypto.randomInt (OS-level CSPRNG),
 *     not Math.random (which is predictable).
 *   - OTPs are hashed with bcrypt before DB storage.
 *
 * USAGE:
 *   const { generateOTP, hashOTP, verifyOTP } = require('../shared/utils/otp');
 *
 *   const otp = generateOTP();            // '482931'
 *   const hash = await hashOTP(otp);      // '$2a$10$...'
 *   // Store hash in DB, send otp via email
 *   const isValid = await verifyOTP('482931', hash);  // true
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/** Salt rounds for OTP hashing (lower than passwords — OTPs are short-lived) */
const OTP_SALT_ROUNDS = 8;

/**
 * Generate a cryptographically secure random 6-digit numeric OTP.
 * Uses crypto.randomInt (Node 18+ CSPRNG) — not Math.random.
 * @returns {string} A 6-character numeric string (e.g., '482931')
 */
const generateOTP = () => {
  // crypto.randomInt uses the OS CSPRNG — unpredictable, uniform distribution.
  // Range: 100000–999999 (always exactly 6 digits).
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP for safe storage in the database.
 * @param {string} otp — The plain-text OTP
 * @returns {Promise<string>} The bcrypt hash
 */
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, OTP_SALT_ROUNDS);
};

/**
 * Verify a user-submitted OTP against a stored hash.
 * @param {string} otp — The plain-text OTP submitted by the user
 * @param {string} hash — The bcrypt hash stored in the database
 * @returns {Promise<boolean>} True if the OTP matches the hash
 */
const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
};
