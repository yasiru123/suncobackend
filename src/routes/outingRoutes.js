const express = require('express');
const router = express.Router();
const {
  createOuting,
  getOutings,
  getOuting,
  recordReapplication,
  endOuting,
  getCurrentOuting
} = require('../controllers/outingController');
const { auth } = require('../middleware/auth');
const { outingValidation } = require('../middleware/validator');

// All routes are protected
router.post('/', auth, outingValidation, createOuting);
router.get('/', auth, getOutings);
router.get('/active/current', auth, getCurrentOuting);
router.get('/:id', auth, getOuting);
router.patch('/:id/reapply', auth, recordReapplication);
router.patch('/:id/end', auth, endOuting);

module.exports = router;


