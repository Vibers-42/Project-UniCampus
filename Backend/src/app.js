/**
 * @file Express App Setup
 * @description Configures Express with middleware and routes, then exports
 *              the app instance.
 *
 * WHY SEPARATE FROM server.js:
 * - app.js creates and configures the Express app.
 * - server.js connects the DB and starts listening.
 * - This separation lets you import app in tests without starting
 *   an actual HTTP server or connecting to a real database.
 *
 * MIDDLEWARE ORDER MATTERS:
 * 1. Parsing & security middleware (runs on every request)
 * 2. Health check (before auth — no token needed)
 * 3. Routes (handles matching requests)
 * 4. 404 handler (catches unmatched routes)
 * 5. Error handler (catches errors thrown in routes/middleware)
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { env } = require('./config');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const logger = require('./shared/utils/logger');

const app = express();

// Trust proxy — required when running behind reverse proxies (Render, Railway,
// Vercel, AWS ALB, Nginx, etc.). Ensures express-rate-limit reads the correct
// client IP from X-Forwarded-For instead of always seeing the proxy's IP.
app.set('trust proxy', 1);

// ──────────────────────────────────────────
// 1. SECURITY HEADERS
// ──────────────────────────────────────────

// Helmet sets security-related HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
// crossOriginResourcePolicy: 'cross-origin' — allows Cloudinary images/PDFs to load
// contentSecurityPolicy: false — CSP disabled for MVP (React injects inline scripts)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ──────────────────────────────────────────
// 2. PARSING MIDDLEWARE
// ──────────────────────────────────────────

// Parse incoming JSON payloads (req.body)
// 16kb limit enforces JSON-only policy — backend never receives binary files
app.use(express.json({ limit: '16kb' }));

// Parse URL-encoded form data (extended: true allows nested objects)
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Parse cookies (available for future use — session tokens, preferences, etc.)
app.use(cookieParser());

// ──────────────────────────────────────────
// 3. NOSQL INJECTION PROTECTION
// ──────────────────────────────────────────
//
// EXPRESS 5 COMPATIBILITY:
//   - express-mongo-sanitize and hpp are NOT compatible with Express 5
//     (req.query is a read-only getter in Express 5).
//   - NoSQL injection is prevented by:
//     1. Mongoose strict schemas — reject operators where strings expected
//     2. express-validator in every route — type-checks all inputs
//     3. Mongoose sanitizeFilter option — strips query operators globally
//   - HTTP Parameter Pollution is a non-issue in Express 5 because
//     req.query is immutable (read-only getter).

// ──────────────────────────────────────────
// 2. SECURITY MIDDLEWARE
// ──────────────────────────────────────────

// CORS — controls which origins can call the API
// In development, Vite may bind to 5173, 5174, 5175, etc. depending on
// which ports are already in use. A dynamic origin function handles this
// so you never get "Network Error" from a port mismatch.
const corsOrigin = (origin, callback) => {
  // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
  if (!origin) return callback(null, true);

  // In development, accept any localhost / 127.0.0.1 origin on any port
  if (env.NODE_ENV === 'development') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
  }

  // In production, only allow the configured CLIENT_URL
  if (origin === env.CLIENT_URL) {
    return callback(null, true);
  }

  callback(new Error('Not allowed by CORS'));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

// Rate limiting — applied globally to all API routes
app.use('/api/', generalLimiter);

// Development helper: Log when rate limit is approached or hit
if (env.NODE_ENV === 'development') {
  const requestCounts = new Map();
  const WINDOW_MS = 15 * 60 * 1000;

  // Reset counts periodically
  setInterval(() => requestCounts.clear(), WINDOW_MS);

  app.use('/api/', (req, res, next) => {
    const ip = req.ip;
    const count = (requestCounts.get(ip) || 0) + 1;
    requestCounts.set(ip, count);

    // Warn at 80% of the limit (500 * 0.8 = 400)
    if (count === 400) {
      logger.warn(`[RATE-LIMIT] IP ${ip} is at 80% of rate limit (${count}/500). Recent: ${req.method} ${req.path}`);
    }
    next();
  });
}

// ──────────────────────────────────────────
// 5. CORS CONFIGURATION
// ──────────────────────────────────────────
// 3. HEALTH CHECK (no auth required)
// ──────────────────────────────────────────

// Deployment platforms (Render, Railway, AWS) and uptime monitors hit this.
// Placed BEFORE the main router so it doesn't need authentication.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UniCampus API running',
    env: env.NODE_ENV,
    timestamp: new Date(),
  });
});

// ──────────────────────────────────────────
// 4. API ROUTES
// ──────────────────────────────────────────

// All routes are mounted under /api/v1
// See routes/index.js for the full route map
app.use('/api/v1', routes);

// ──────────────────────────────────────────
// 5. ERROR HANDLING (must be AFTER routes)
// ──────────────────────────────────────────

// Catch requests to undefined routes → 404
app.use(notFoundHandler);

// Catch all errors thrown/forwarded during request handling
app.use(errorHandler);

module.exports = app;
