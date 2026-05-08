/** @file notifications.validation.js */
const { param } = require('express-validator');
const validateId = [param('id').isMongoId().withMessage('Invalid notification ID')];
module.exports = { validateId };
