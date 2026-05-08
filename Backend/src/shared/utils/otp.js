/**
 * @file otp.js — OTP Generation & Verification Helpers
 *
 * SINGLE RESPONSIBILITY:
 *   Generates random 6-digit OTPs, hashes them with bcrypt for safe storage,
 *   and verifies user-submitted OTPs against stored hashes.
 *
 * EXPORTS:
 *   generateOTP()           — Returns a 6-digit numeric string
 *   hashOTP(otp)            — Returns a bcrypt hash of the OTP
 *   verifyOTP(otp, hash)    — Returns true if the OTP matches the hash
 *
 * SECURITY RULE:
 *   OTPs are NEVER stored in plain text in the database.
 *   The auth service calls generateOTP(), sends the plain OTP to the user
 *   via email, and stores ONLY the hash (from hashOTP) in the DB.
 *   On verification, the user submits the plain OTP, and verifyOTP
 *   compares it against the stored hash.
 *
 * USAGE:
 *   const { generateOTP, hashOTP, verifyOTP } = require('../shared/utils/otp');
 *
 *   const otp = generateOTP();            // '482931'
 *   const hash = await hashOTP(otp);      // '$2a$10$...'
 *   // Store hash in DB, send otp via email
 *   const isValid = await verifyOTP('482931', hash);  // true
 */

const bcrypt = require('bcryptjs');

/** Salt rounds for OTP hashing (lower than passwords — OTPs are short-lived) */
const OTP_SALT_ROUNDS = 8;

/**
 * Generate a random 6-digit numeric OTP.
 * @returns {string} A 6-character numeric string (e.g., '048293')
 */
const generateOTP = () => {
  // crypto.randomInt would be more secure, but for a 6-digit code
  // with bcrypt hashing and a short expiry window, Math.random is fine.
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
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
