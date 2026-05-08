/**
 * @file Server Entry Point
 * @description Loads environment, connects to the database, and starts
 *              the HTTP server.
 *
 * WHY THIS IS THE ENTRY POINT:
 * - dotenv.config() runs FIRST, before any other import, so all modules
 *   see the environment variables when they load.
 * - Keeps the startup sequence clear and linear:
 *   1. Load env vars
 *   2. Connect to MongoDB
 *   3. Start listening for HTTP requests
 * - Handles fatal errors (unhandled rejections, uncaught exceptions)
 *   gracefully so the process doesn't die silently.
 */

// ── Step 0: Load .env BEFORE any other imports ──
// This must be the FIRST line so all modules see the env vars.
require('dotenv').config();

const app = require('./app');
const { env, connectDB } = require('./config');
const logger = require('./shared/utils/logger');

/**
 * Start the server.
 * Connects to the database first, then begins listening for requests.
 */
const startServer = async () => {
  try {
    // ── Step 1: Connect to MongoDB ──
    await connectDB();

    // ── Step 2: Start HTTP server ──
    app.listen(env.PORT, () => {
      logger.info(
        `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
      logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ──────────────────────────────────────────
// GLOBAL ERROR SAFETY NETS
// These prevent the Node process from crashing silently on unhandled errors.
// In production, you'd also want to alert your monitoring service here.
// ──────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// ── Start ──
startServer();
