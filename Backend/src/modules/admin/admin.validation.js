/** @file admin.validation.js */
const { param } = require('express-validator');
const validateEmail = [param('email').isEmail().withMessage('Invalid email').normalizeEmail()];
const validateId = [param('id').isMongoId().withMessage('Invalid ID')];
module.exports = { validateEmail, validateId };
