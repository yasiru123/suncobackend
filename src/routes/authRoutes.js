const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  getMe,
  updateProfile,
  completeOnboarding
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  skinTypeValidation
} = require('../middleware/validator');

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', auth, getMe);
router.patch('/profile', auth, updateProfile);
router.patch('/complete-onboarding', auth, completeOnboarding);

module.exports = router;


