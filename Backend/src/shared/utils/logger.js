/**
 * @file Logger Utility
 * @description Lightweight, timestamped logger with level-based methods.
 *
 * WHY THIS EXISTS:
 * - Raw console.log offers no timestamps, no levels, and is hard to filter.
 * - This provides a consistent logging interface across the entire app.
 * - When you're ready for production-grade logging (Winston, Pino, etc.),
 *   swap the internals of this file — every call site stays the same.
 *
 * LEVELS:
 *   debug — Verbose development info (suppressed in production)
 *   info  — Normal operational messages
 *   warn  — Something unexpected but non-breaking
 *   error — Something failed but the process continues
 *   fatal — Something failed and the process must exit
 *
 * NOTE: This file imports NODE_ENV from config/env.js rather than reading
 * process.env directly, respecting the architectural rule that env.js is
 * the ONLY file that reads process.env.
 *
 * USAGE:
 *   const logger = require('../shared/utils/logger');
 *   logger.info('Server started');
 *   logger.error('Something broke', error);
 *   logger.fatal('Unhandled rejection — shutting down', error);
 */

const env = require('../../config/env');

/**
 * Get a formatted timestamp string.
 * @returns {string} ISO timestamp
 */
const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, ...args) => {
    console.log(`[${getTimestamp()}] [INFO]  ${message}`, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`[${getTimestamp()}] [WARN]  ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`, ...args);
  },

  /**
   * Fatal errors — the process is about to exit.
   * Used for unhandledRejection, uncaughtException, and startup failures.
   */
  fatal: (message, ...args) => {
    console.error(`[${getTimestamp()}] [FATAL] ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  },
};

module.exports = logger;
