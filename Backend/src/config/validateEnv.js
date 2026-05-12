/**
 * @file validateEnv.js — Startup Environment Validation
 *
 * SINGLE RESPONSIBILITY:
 *   Validates that all critical environment variables are set before
 *   the server starts. If any required variable is missing, the process
 *   exits with a clear error message.
 *
 * WHY THIS EXISTS:
 *   Without startup validation, a missing env variable causes cryptic
 *   runtime errors deep in business logic (e.g., "Cannot read property
 *   of undefined" in Firebase or Cloudinary). This catches problems
 *   immediately with actionable messages.
 *
 * USAGE:
 *   Called once at the top of server.js, after dotenv.config().
 *   const validateEnv = require('./config/validateEnv');
 *   validateEnv();
 */

const logger = require('../shared/utils/logger');

/**
 * Required environment variables grouped by service.
 * Each entry: { name, service, required }
 * required = true means server MUST NOT start without it.
 * required = false means a warning is logged but server continues.
 */
const ENV_SCHEMA = [
  // Database
  { name: 'MONGODB_URI',            service: 'MongoDB',    required: true  },

  // Firebase Admin SDK
  { name: 'FIREBASE_PROJECT_ID',    service: 'Firebase',   required: true  },
  { name: 'FIREBASE_CLIENT_EMAIL',  service: 'Firebase',   required: true  },
  { name: 'FIREBASE_PRIVATE_KEY',   service: 'Firebase',   required: true  },

  // Cloudinary
  { name: 'CLOUDINARY_CLOUD_NAME',  service: 'Cloudinary', required: false },
  { name: 'CLOUDINARY_API_KEY',     service: 'Cloudinary', required: false },
  { name: 'CLOUDINARY_API_SECRET',  service: 'Cloudinary', required: false },

  // CORS / Frontend
  { name: 'CLIENT_URL',             service: 'CORS',       required: false },

  // AI (optional — degrades gracefully)
  { name: 'GROQ_API_KEY',           service: 'Groq AI',    required: false },
];

/**
 * Validate all environment variables at startup.
 * Exits process with code 1 if any required variable is missing.
 */
const validateEnv = () => {
  const missing = [];
  const warnings = [];

  for (const { name, service, required } of ENV_SCHEMA) {
    const value = process.env[name];
    if (!value || value.trim() === '') {
      if (required) {
        missing.push(`  ✗ ${name} (${service})`);
      } else {
        warnings.push(`  ⚠ ${name} (${service}) — optional, feature will be degraded`);
      }
    }
  }

  // Log warnings for optional missing vars
  if (warnings.length > 0) {
    logger.warn('Missing optional environment variables:');
    warnings.forEach(w => logger.warn(w));
  }

  // Fatal exit for required missing vars
  if (missing.length > 0) {
    logger.error('═══════════════════════════════════════════════');
    logger.error('FATAL: Missing required environment variables:');
    logger.error('═══════════════════════════════════════════════');
    missing.forEach(m => logger.error(m));
    logger.error('');
    logger.error('Create a .env file in the Backend/ directory with these variables.');
    logger.error('See .env.example for reference.');
    logger.error('═══════════════════════════════════════════════');
    process.exit(1);
  }

  logger.info('Environment validation passed');
};

module.exports = validateEnv;
