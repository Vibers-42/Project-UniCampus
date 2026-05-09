/**
 * @file validation.middleware.js — Express-Validator Result Checker
 *
 * SINGLE RESPONSIBILITY:
 *   Runs AFTER an express-validator validation chain and BEFORE the controller.
 *   Checks if the chain reported any errors. If errors exist, creates a
 *   proper error and passes it to error.middleware via next(err).
 *
 * WHY THIS EXISTS:
 *   express-validator chains validate fields but don't stop the request.
 *   This middleware checks the results and short-circuits the request
 *   before it reaches the controller.
 *
 * FAILURE BEHAVIOR:
 *   On validation failure, this middleware passes an error to next(err).
 *   It NEVER sends a response directly. All response formatting is
 *   handled by error.middleware.js.
 *
 * USAGE IN ROUTES:
 *   const { registerRules } = require('../modules/auth/auth.validation');
 *   const validate = require('../middleware/validation.middleware');
 *
 *   router.post('/register', registerRules, validate, authController.register);
 *
 * HOW IT WORKS:
 *   1. express-validator chains run as middleware, populating errors.
 *   2. This middleware calls validationResult(req) to collect them.
 *   3. If errors → creates an error with details and passes to next(err).
 *   4. If no errors → calls next() to proceed to the controller.
 */

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors as a readable string for the error message
    const errorMessages = errors
      .array()
      .map((e) => `${e.path}: ${e.msg}`)
      .join('. ');

    const err = new Error(errorMessages);
    err.statusCode = 422;

    // Attach the structured errors array for consumers who want field-level detail
    err.validationErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    return next(err);
  }

  next();
};

module.exports = validate;
