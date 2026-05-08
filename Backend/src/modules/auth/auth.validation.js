/**
 * @file auth.validation.js — Express-Validator Chains for Auth Routes
 *
 * SINGLE RESPONSIBILITY:
 *   Defines validation rules for each auth endpoint. These arrays are
 *   passed as middleware in auth.routes.js, before the controller runs.
 *   If validation fails, validation.middleware.js catches it and forwards
 *   the error to error.middleware.js.
 *
 * SCOPE:
 *   Internal to auth/ — only auth.routes.js imports this file.
 *
 * USAGE:
 *   // In auth.routes.js:
 *   router.post('/register', validateRegister, validate, controller.register);
 */

const { body, cookie } = require('express-validator');

/**
 * validateRegister — Rules for POST /auth/register
 *
 * Checks:
 *   - email: required, valid email format, institutional domain (.edu)
 *   - role: optional, must be one of the allowed values
 *
 * INSTITUTIONAL DOMAIN CHECK:
 *   Currently checks for .edu — customize this regex for your university.
 *   Examples:
 *     /.edu$/i           — any .edu domain
 *     /@university.edu$/ — specific university only
 *   To disable: remove the custom validator below.
 */
const validateRegister = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom((value) => {
      // Institutional domain check — modify this pattern for your university
      // Accepts: any .edu or .ac.in domain
      // To accept all domains (dev/testing), comment out this block.
      const institutionalPattern = /\.(edu|ac\.in)$/i;
      const domain = value.split('@')[1];
      if (!institutionalPattern.test(domain)) {
        throw new Error(
          'Please use your institutional email address (.edu or .ac.in)'
        );
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(['student', 'clubAdmin', 'admin'])
    .withMessage('Role must be student, clubAdmin, or admin'),
];

/**
 * validateVerifyOTP — Rules for POST /auth/verify-otp
 *
 * Checks:
 *   - email: required, valid format
 *   - otp: required, exactly 6 digits
 */
const validateVerifyOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

/**
 * validateResendOTP — Rules for POST /auth/resend-otp
 *
 * Checks:
 *   - email: required, valid format
 */
const validateResendOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

/**
 * validateRefresh — Rules for POST /auth/refresh
 *
 * Checks:
 *   - refreshToken cookie exists and is not empty
 *
 * NOTE: This is available for explicit validation if needed.
 *       The current route setup handles missing cookies in the service layer.
 */
const validateRefresh = [
  cookie('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required. Please log in again.'),
];

module.exports = {
  validateRegister,
  validateVerifyOTP,
  validateResendOTP,
  validateRefresh,
};
