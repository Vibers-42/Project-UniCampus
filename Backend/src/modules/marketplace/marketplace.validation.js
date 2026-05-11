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
    .isIn([
      'Electronics', 'Books', 'Lab Equipment', 'Stationery', 
      'Hostel Essentials', 'Gadgets', 'Cycles', 'Furniture', 
      'Study Materials', 'Event Passes', 'Calculators', 'Other'
    ])
    .withMessage('Invalid category'),
  body('condition')
    .notEmpty().withMessage('Condition is required')
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  body('image')
    .notEmpty().withMessage('Image URL is required'),
  body('contactInfo')
    .notEmpty().withMessage('Contact info is required'),
  body('negotiable')
    .optional().isBoolean(),
  body('department')
    .optional().isString(),
  body('location')
    .optional().isString(),
  body('tags')
    .optional().isArray(),
  body('attachments')
    .optional().isArray()
];

const getListingsValidation = [
  query('category').optional().isIn([
    'Electronics', 'Books', 'Lab Equipment', 'Stationery', 
    'Hostel Essentials', 'Gadgets', 'Cycles', 'Furniture', 
    'Study Materials', 'Event Passes', 'Calculators', 'Other'
  ]),
  query('search').optional().isString(),
  query('sellerId').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

const itemIDValidation = [
  param('id').isMongoId().withMessage('Invalid item ID')
];

const updateListingValidation = [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('title')
    .optional()
    .isLength({ max: 100 }).withMessage('Title too long'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description too long'),
  body('price')
    .optional()
    .isNumeric().withMessage('Price must be a number'),
  body('category')
    .optional()
    .isIn([
      'Electronics', 'Books', 'Lab Equipment', 'Stationery', 
      'Hostel Essentials', 'Gadgets', 'Cycles', 'Furniture', 
      'Study Materials', 'Event Passes', 'Calculators', 'Other'
    ])
    .withMessage('Invalid category'),
  body('condition')
    .optional()
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  body('image')
    .optional(),
  body('contactInfo')
    .optional(),
  body('negotiable')
    .optional().isBoolean(),
  body('department')
    .optional().isString(),
  body('location')
    .optional().isString(),
  body('tags')
    .optional().isArray(),
  body('attachments')
    .optional().isArray()
];

module.exports = {
  createListingValidation,
  getListingsValidation,
  itemIDValidation,
  updateListingValidation
};
