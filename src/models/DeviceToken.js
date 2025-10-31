const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // FCM token for Android or APNs token for iOS
  token: {
    type: String,
    required: true,
    unique: true
  },
  // Platform: ios, android
  platform: {
    type: String,
    enum: ['ios', 'android'],
    required: true
  },
  // Device info (optional)
  deviceInfo: {
    deviceId: String,
    model: String,
    osVersion: String,
    appVersion: String
  },
  // Whether this token is active
  isActive: {
    type: Boolean,
    default: true
  },
  // Last time a notification was successfully sent to this token
  lastNotificationSent: {
    type: Date,
    default: null
  },
  // Number of failed notification attempts (to disable dead tokens)
  failedAttempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user's active tokens
deviceTokenSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);


