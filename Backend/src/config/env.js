/**
 * @file Environment Variable Reader
 * @description THE ONLY FILE IN THE ENTIRE APP that reads process.env.
 *
 * WHY THIS EXISTS:
 * - Single source of truth for all environment configuration.
 * - If a variable name changes in .env, you fix it HERE and nowhere else.
 * - Freezing prevents accidental mutation at runtime.
 * - Fail-fast: missing critical vars are caught at startup, not deep in
 *   business logic where the error message would be cryptic.
 *
 * GOLDEN RULE:
 *   No other file in the codebase should read process.env directly.
 *   Every file imports from this module instead.
 *
 * USAGE:
 *   const env = require('./config/env');
 *   console.log(env.PORT);
 */

const env = Object.freeze({
  // ───── Server ─────
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  // ───── Database ─────
  MONGODB_URI: process.env.MONGODB_URI || '',

  // ───── CORS ─────
  // In development: '*' allows all origins.
  // In production: set to your frontend URL (e.g., https://unicampus.vercel.app).
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // ───── JWT ─────
  // Two separate secrets for access and refresh tokens.
  // Access tokens are short-lived (carried in Authorization header).
  // Refresh tokens are long-lived (stored in httpOnly cookie).
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',

  // ───── Cloudinary ─────
  // ARCHITECTURE:
  //   Backend handles JSON + business logic only.
  //   Binary files upload directly from frontend → Cloudinary (unsigned preset).
  //   MongoDB stores only metadata + Cloudinary URLs — never binary data.
  //
  // These credentials are available server-side for:
  //   - Generating signed URLs / deletion tokens
  //   - Admin operations (e.g., deleting orphaned images)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // ───── Email (Nodemailer) ─────
  // Used for OTP delivery during registration/verification.
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',

  // ───── LLM / AI Chatbot ─────
  // Provider-agnostic: set LLM_PROVIDER to 'openai', 'claude', or 'gemini'.
  // Only aiService.js reads these — swap providers without touching any module.
  LLM_PROVIDER: process.env.LLM_PROVIDER || '',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
});

module.exports = env;
