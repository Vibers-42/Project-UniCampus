const { body, query, param } = require('express-validator');

const createListingValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title too long'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description too long'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Books', 'Calculators', 'Lab Equipment', 'Hostel Items', 'Gadgets', 'Cycles', 'Study Materials', 'Event Passes', 'Other'])
    .withMessage('Invalid category'),
  body('condition')
    .notEmpty().withMessage('Condition is required')
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  body('image')
    .notEmpty().withMessage('Image URL is required'),
  body('contactInfo')
    .notEmpty().withMessage('Contact info is required')
];

const getListingsValidation = [
  query('category').optional().isIn(['Books', 'Calculators', 'Lab Equipment', 'Hostel Items', 'Gadgets', 'Cycles', 'Study Materials', 'Event Passes', 'Other']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

const itemIDValidation = [
  param('id').isMongoId().withMessage('Invalid item ID')
];

module.exports = {
  createListingValidation,
  getListingsValidation,
  itemIDValidation
};
