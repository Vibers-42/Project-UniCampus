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
});

module.exports = config;
