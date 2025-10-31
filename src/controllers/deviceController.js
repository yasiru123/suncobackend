const DeviceToken = require('../models/DeviceToken');

/**
 * @route   POST /api/device/register
 * @desc    Register a device token for push notifications
 * @access  Private
 */
const registerDevice = async (req, res) => {
  try {
    const { token, platform, deviceInfo } = req.body;
    const userId = req.userId;

    // Check if token already exists for this user
    let deviceToken = await DeviceToken.findOne({ token });

    if (deviceToken) {
      // Update existing token
      deviceToken.userId = userId;
      deviceToken.platform = platform;
      deviceToken.deviceInfo = deviceInfo || deviceToken.deviceInfo;
      deviceToken.isActive = true;
      deviceToken.failedAttempts = 0;
    } else {
      // Create new device token
      deviceToken = new DeviceToken({
        userId,
        token,
        platform,
        deviceInfo,
        isActive: true
      });
    }

    await deviceToken.save();

    res.status(201).json({
      success: true,
      data: { deviceToken },
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error registering device'
    });
  }
};

/**
 * @route   DELETE /api/device/unregister/:token
 * @desc    Unregister a device token
 * @access  Private
 */
const unregisterDevice = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.userId;

    const deviceToken = await DeviceToken.findOneAndUpdate(
      { token, userId },
      { isActive: false },
      { new: true }
    );

    if (!deviceToken) {
      return res.status(404).json({
        success: false,
        error: 'Device token not found'
      });
    }

    res.json({
      success: true,
      data: { deviceToken },
      message: 'Device unregistered successfully'
    });
  } catch (error) {
    console.error('Unregister device error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error unregistering device'
    });
  }
};

/**
 * @route   GET /api/device/tokens
 * @desc    Get all active device tokens for current user
 * @access  Private
 */
const getDeviceTokens = async (req, res) => {
  try {
    const userId = req.userId;

    const tokens = await DeviceToken.find({
      userId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tokens }
    });
  } catch (error) {
    console.error('Get device tokens error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching device tokens'
    });
  }
};

module.exports = {
  registerDevice,
  unregisterDevice,
  getDeviceTokens
};


