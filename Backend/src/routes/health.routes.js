/**
 * @file Health Check Routes
 * @description Defines routes for the health check endpoint.
 *
 * PATTERN:
 * - Routes are thin — they only define the HTTP method, path, and middleware chain.
 * - All logic lives in the controller.
 * - This separation means routes are easy to scan and middleware is explicit.
 */

const { Router } = require('express');
const { getHealthStatus } = require('../controllers/health.controller');

const router = Router();

// GET /api/v1/health
router.get('/', getHealthStatus);

module.exports = router;
