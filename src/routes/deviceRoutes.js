const express = require('express');
const router = express.Router();
const {
  registerDevice,
  unregisterDevice,
  getDeviceTokens
} = require('../controllers/deviceController');
const { auth } = require('../middleware/auth');
const { deviceTokenValidation } = require('../middleware/validator');

// All routes are protected
router.post('/register', auth, deviceTokenValidation, registerDevice);
router.delete('/unregister/:token', auth, unregisterDevice);
router.get('/tokens', auth, getDeviceTokens);

module.exports = router;


