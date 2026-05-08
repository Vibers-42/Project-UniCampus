/**
 * @file Central Configuration
 * @description Reads all environment variables once and exports a frozen config object.
 *
 * WHY THIS EXISTS:
 * - Single source of truth for all config values across the app.
 * - Freezing prevents accidental mutation at runtime.
 * - If a required variable is missing, the app fails fast here instead of
 *   throwing cryptic errors deep inside business logic.
 *
 * USAGE:
 *   const config = require('./config');
 *   console.log(config.PORT);
 */

const dotenv = require('dotenv');

// Load .env file into process.env
dotenv.config();

const config = Object.freeze({
  // ───── Server ─────
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  // ───── Database ─────
  MONGODB_URI: process.env.MONGODB_URI || '',

  // ───── CORS ─────
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // ───── JWT (placeholder — will be used after auth module is built) ─────
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',

  // ───── Cloudinary ─────
  // ARCHITECTURE:
  //   Backend handles JSON + business logic only.
  //   Binary files upload directly from frontend → Cloudinary (unsigned preset).
  //   MongoDB stores only metadata + Cloudinary URLs — never binary data.
  //
  // These credentials are available server-side for:
  //   - Generating signed URLs / deletion tokens
  //   - Admin operations (e.g., deleting orphaned images)
  //   - Future signed-upload support if needed
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || '',
});

module.exports = config;
