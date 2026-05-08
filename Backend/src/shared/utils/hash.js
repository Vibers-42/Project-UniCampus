/**
 * @file hash.js — Password Hashing Helpers
 *
 * SINGLE RESPONSIBILITY:
 *   Hashes and compares passwords using bcrypt. No business logic.
 *   No knowledge of any module.
 *
 * EXPORTS:
 *   hashPassword(plainText)            — Returns a bcrypt hash
 *   comparePassword(plainText, hash)   — Returns true if they match
 *
 * WHY THIS EXISTS:
 *   Never store passwords in plain text. bcrypt adds a random salt
 *   automatically per hash, so even identical passwords produce
 *   different hashes. Centralizing here means if you switch to
 *   argon2 or scrypt, only this file changes.
 *
 * USAGE:
 *   const { hashPassword, comparePassword } = require('../shared/utils/hash');
 *   const hashed = await hashPassword('myPassword123');
 *   const isMatch = await comparePassword('myPassword123', hashed);
 */

const bcrypt = require('bcryptjs');

/**
 * Salt rounds for bcrypt.
 * 12 is a good balance of security and performance.
 * Each increment roughly doubles the computation time.
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 * @param {string} plainText — The raw password
 * @returns {Promise<string>} The bcrypt hash
 */
const hashPassword = async (plainText) => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a bcrypt hash.
 * @param {string} plainText — The raw password to check
 * @param {string} hash — The stored bcrypt hash
 * @returns {Promise<boolean>} True if they match
 */
const comparePassword = async (plainText, hash) => {
  return bcrypt.compare(plainText, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
