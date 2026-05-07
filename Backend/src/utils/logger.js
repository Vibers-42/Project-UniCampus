/**
 * @file Logger Utility
 * @description Lightweight, timestamped logger with level-based methods.
 *
 * WHY THIS EXISTS:
 * - Raw `console.log` offers no timestamps, no levels, and is hard to filter.
 * - This provides a consistent logging interface across the entire app.
 * - When you're ready for production-grade logging (Winston, Pino, etc.),
 *   swap the internals of this file — every call site stays the same.
 *
 * USAGE:
 *   const logger = require('../utils/logger');
 *   logger.info('Server started');
 *   logger.error('Something broke', error);
 */

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

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  },
};

module.exports = logger;
