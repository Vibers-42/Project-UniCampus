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

// ── Step 0.5: Validate environment ──
// Exits immediately with clear error messages if critical vars are missing.
const validateEnv = require('./config/validateEnv');
validateEnv();

const app = require('./app');
const { env, connectDB } = require('./config');
const logger = require('./shared/utils/logger');
const cron = require('node-cron');
const { cleanupUnverifiedUsers } = require('./utils/cleanupUnverifiedUsers');

// Study group routes now consolidated in routes/index.js → /api/v1/study-groups
const http = require('http');
const { initSocket } = require('./config/socket');

/**
 * Start the server.
 * Connects to the database first, then begins listening for requests.
 */
const startServer = async () => {
  try {
    // ── Step 1: Connect to MongoDB ──
    await connectDB();

    // ── Step 2: Start HTTP + Socket.io server ──
    const server = http.createServer(app);
    const io = initSocket(server);
    app.set('io', io); // Make io accessible in controllers via req.app.get('io')

    // Study group routes registered in routes/index.js (no duplicate mount needed)

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(
          `Port ${env.PORT} is already in use. ` +
          `Kill the process using it (run: netstat -ano | findstr :${env.PORT}) then restart.`
        );
      } else {
        logger.error('Server error:', err);
      }
      process.exit(1);
    });

    server.listen(env.PORT, () => {
      logger.info(
        `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
      logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    // ── Step 3: Schedule cleanup job ──
    // Runs every hour. Deletes unverified Firebase accounts older than 24h
    // that have no MongoDB user record.
    cron.schedule('0 * * * *', () => {
      cleanupUnverifiedUsers()
        .catch((err) => logger.error('Cleanup job failed:', err.message));
    });
    logger.info('Scheduled: unverified account cleanup (hourly)');
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
