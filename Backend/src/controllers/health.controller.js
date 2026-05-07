/**
 * @file Health Check Controller
 * @description Returns server status, uptime, and environment info.
 *
 * WHY THIS EXISTS:
 * - Provides a quick way to verify the server is running and reachable.
 * - Useful for deployment health checks (Render, load balancers, uptime monitors).
 * - Demonstrates the controller → asyncHandler → ApiResponse pattern that
 *   every future controller will follow.
 */

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { HttpStatus } = require('../constants');

/**
 * @route   GET /api/v1/health
 * @desc    Returns server health status
 * @access  Public
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const healthData = {
    status: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, healthData, 'Server is healthy'));
});

module.exports = {
  getHealthStatus,
};
