/**
 * @file Server Entry Point
 * @description Loads environment, connects to the database, and starts
 *              the HTTP server.
 *
 * WHY THIS IS THE ENTRY POINT:
 * - Keeps the startup sequence clear and linear:
 *   1. Load env vars (already done by config/index.js on first require)
 *   2. Connect to MongoDB
 *   3. Start listening for HTTP requests
 * - Handles fatal errors (unhandled rejections, uncaught exceptions)
 *   gracefully so the process doesn't die silently.
 */

const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config');
const logger = require('./utils/logger');

/**
 * Start the server.
 * Connects to the database first, then begins listening for requests.
 */
const startServer = async () => {
  try {
    // ── Step 1: Connect to MongoDB ──
    await connectDB();

    // ── Step 2: Start HTTP server ──
    app.listen(config.PORT, () => {
      logger.info(
        `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
      );
      logger.info(`Health check: http://localhost:${config.PORT}/api/v1/health`);
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
  // Don't crash — log it and let the process continue.
  // In production, you may want to shut down gracefully instead.
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Uncaught exceptions leave the process in an undefined state.
  // Best practice is to log, clean up, and exit.
  process.exit(1);
});

// ── Start ──
startServer();
