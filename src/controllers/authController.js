const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { email, password, name, skinType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      skinType,
      hasCompletedOnboarding: false
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          skinType: user.skinType,
          medValue: user.medValue,
          hasCompletedOnboarding: user.hasCompletedOnboarding
        },
        accessToken,
        refreshToken
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          skinType: user.skinType,
          medValue: user.medValue,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          currentOutingId: user.currentOutingId
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during login'
    });
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during token refresh'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('currentOutingId');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          skinType: user.skinType,
          medValue: user.medValue,
          spf: user.spf,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          currentOutingId: user.currentOutingId,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching user profile'
    });
  }
};

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile (name, skin type, SPF)
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, skinType, spf } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (skinType !== undefined) updateFields.skinType = skinType;
    if (spf !== undefined) updateFields.spf = spf;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          skinType: user.skinType,
          medValue: user.medValue,
          spf: user.spf,
          hasCompletedOnboarding: user.hasCompletedOnboarding
        }
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating profile'
    });
  }
};

/**
 * @route   PATCH /api/auth/complete-onboarding
 * @desc    Mark onboarding as completed
 * @access  Private
 */
const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { hasCompletedOnboarding: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user },
      message: 'Onboarding completed'
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error completing onboarding'
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  getMe,
  updateProfile,
  completeOnboarding
};


