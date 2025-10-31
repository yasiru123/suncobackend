const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  outingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outing',
    default: null
  },
  readingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reading',
    default: null
  },
  // Type of notification
  type: {
    type: String,
    enum: [
      'initial_reminder',      // "Please wear sunscreen at least 20mins prior to going out"
      'reapply_reminder',      // "It's time to reapply sunscreen or seek shade"
      'outing_start',          // When outing is about to start
      'background_warning',    // If background permissions are not granted
      'custom'                 // For any other custom notifications
    ],
    required: true
  },
  // Notification title
  title: {
    type: String,
    required: true
  },
  // Notification body/message
  message: {
    type: String,
    required: true
  },
  // Cumulative dose at the time of notification (if applicable)
  cumulativeDoseAtNotification: {
    type: Number,
    default: null
  },
  // MED threshold at the time
  medThreshold: {
    type: Number,
    default: null
  },
  // Current UVI at the time
  currentUVI: {
    type: Number,
    default: null
  },
  // Delivery status
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'clicked'],
    default: 'pending'
  },
  // FCM/APNs response (for debugging)
  deliveryResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Whether notification was sent via push or local
  channel: {
    type: String,
    enum: ['push', 'local', 'both'],
    default: 'push'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying notification history
notificationLogSchema.index({ userId: 1, timestamp: -1 });
notificationLogSchema.index({ outingId: 1, type: 1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);


