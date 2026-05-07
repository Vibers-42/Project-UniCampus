/**
 * @file Database Connection
 * @description Connects to MongoDB Atlas via Mongoose.
 *
 * WHY THIS EXISTS:
 * - Encapsulates DB connection logic in one place.
 * - Provides clear error messages if the URI is missing or invalid.
 * - Registers event listeners so connection issues are logged, not silent.
 * - Exported as a reusable function so `server.js` can call it during startup.
 *
 * SCALABILITY:
 * - If you ever need read replicas or multiple databases, this is the file
 *   to extend — the rest of the app stays untouched.
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB using the URI from environment variables.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is not defined. Check your .env file.'
      );
    }

    const conn = await mongoose.connect(config.MONGODB_URI);

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // ───── Connection Event Listeners ─────

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit with failure — no point running without a DB
  }
};

module.exports = connectDB;
