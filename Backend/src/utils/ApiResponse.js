/**
 * @file Standardized API Response
 * @description Wraps successful responses in a consistent shape.
 *
 * WHY THIS EXISTS:
 * - The frontend should never have to guess the response structure.
 * - Every success response follows: { statusCode, data, message, success }.
 * - Pairs with ApiError so both success and failure have the same shape keys.
 *
 * USAGE:
 *   res.status(200).json(new ApiResponse(200, userData, 'User fetched'));
 */

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response payload
   * @param {string} [message='Success'] - Human-readable message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
