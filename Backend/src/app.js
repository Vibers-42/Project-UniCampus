/**
 * @file Express App Setup
 * @description Configures Express with middleware and routes, then exports
 *              the app instance.
 *
 * WHY SEPARATE FROM server.js:
 * - app.js creates and configures the Express app.
 * - server.js connects the DB and starts listening.
 * - This separation lets you import `app` in tests without starting
 *   an actual HTTP server or connecting to a real database.
 *
 * MIDDLEWARE ORDER MATTERS:
 * 1. Parsing & security middleware (runs on every request)
 * 2. Routes (handles matching requests)
 * 3. 404 handler (catches unmatched routes)
 * 4. Error handler (catches errors thrown in routes/middleware)
 */

const express = require('express');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// ──────────────────────────────────────────
// 1. PARSING MIDDLEWARE
// ──────────────────────────────────────────

// Parse incoming JSON payloads (req.body)
app.use(express.json({ limit: '16kb' }));

// Parse URL-encoded form data (extended: true allows nested objects)
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// ──────────────────────────────────────────
// 2. SECURITY MIDDLEWARE
// ──────────────────────────────────────────

// CORS — controls which origins can call your API
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// SECURITY SUGGESTIONS (add these packages when ready for production):
//
// helmet     — Sets security-related HTTP headers (XSS, clickjacking, etc.)
//              Usage: app.use(require('helmet')());
//
// express-rate-limit — Rate limiting to prevent brute-force attacks
//              Usage: app.use(require('express-rate-limit')({ windowMs: 15*60*1000, max: 100 }));
//
// express-mongo-sanitize — Prevents NoSQL injection attacks
//              Usage: app.use(require('express-mongo-sanitize')());
//
// hpp        — Protects against HTTP parameter pollution
//              Usage: app.use(require('hpp')());

// ──────────────────────────────────────────
// 3. API ROUTES
// ──────────────────────────────────────────

// All routes are mounted under /api/v1
// See routes/index.js for the full route map
app.use('/api/v1', routes);

// ──────────────────────────────────────────
// 4. ERROR HANDLING (must be AFTER routes)
// ──────────────────────────────────────────

// Catch requests to undefined routes → 404
app.use(notFoundHandler);

// Catch all errors thrown/forwarded during request handling
app.use(errorHandler);

module.exports = app;
