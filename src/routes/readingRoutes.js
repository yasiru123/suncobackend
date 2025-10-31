const express = require('express');
const router = express.Router();
const {
  createReading,
  getReadings,
  getReading,
  getReadingStats
} = require('../controllers/readingController');
const { auth } = require('../middleware/auth');
const { readingLimiter } = require('../middleware/rateLimiter');
const { readingValidation, dateRangeValidation } = require('../middleware/validator');

// All routes are protected
router.post('/', auth, readingLimiter, readingValidation, createReading);
router.get('/', auth, dateRangeValidation, getReadings);
router.get('/stats', auth, dateRangeValidation, getReadingStats);
router.get('/:id', auth, getReading);

module.exports = router;


