const { body, validationResult, query, param } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('skinType')
    .isInt({ min: 1, max: 6 })
    .withMessage('Skin type must be an integer between 1 and 6'),
  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Validation rules for reading submission
 */
const readingValidation = [
  body('uvi')
    .isFloat({ min: 0, max: 20 })
    .withMessage('UVI must be a number between 0 and 20'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date'),
  body('doseIncrement')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Dose increment must be a non-negative number'),
  body('cumulativeDose')
    .isFloat({ min: 0 })
    .withMessage('Cumulative dose must be a non-negative number'),
  body('intervalSeconds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Interval seconds must be a non-negative integer'),
  body('source')
    .optional()
    .isIn(['foreground', 'background', 'server', 'manual'])
    .withMessage('Source must be one of: foreground, background, server, manual'),
  validate
];

/**
 * Validation rules for outing creation
 */
const outingValidation = [
  body('plannedStartTime')
    .isISO8601()
    .withMessage('Planned start time must be a valid ISO 8601 date'),
  body('startLocation')
    .optional()
    .isObject()
    .withMessage('Start location must be an object'),
  body('startLocation.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Start location latitude must be between -90 and 90'),
  body('startLocation.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Start location longitude must be between -180 and 180'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters'),
  validate
];

/**
 * Validation rules for device token registration
 */
const deviceTokenValidation = [
  body('token')
    .notEmpty()
    .isString()
    .withMessage('Token is required and must be a string'),
  body('platform')
    .isIn(['ios', 'android'])
    .withMessage('Platform must be either ios or android'),
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Device info must be an object'),
  validate
];

/**
 * Validation rules for skin type update
 */
const skinTypeValidation = [
  body('skinType')
    .isInt({ min: 1, max: 6 })
    .withMessage('Skin type must be an integer between 1 and 6'),
  validate
];

/**
 * Query validation for date ranges
 */
const dateRangeValidation = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  readingValidation,
  outingValidation,
  deviceTokenValidation,
  skinTypeValidation,
  dateRangeValidation
};


