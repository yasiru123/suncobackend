const axios = require('axios');
const DeviceToken = require('../models/DeviceToken');
const NotificationLog = require('../models/NotificationLog');

/**
 * Send push notification via FCM (Firebase Cloud Messaging)
 * @param {string} token - Device FCM token
 * @param {object} notification - Notification payload
 * @returns {Promise<object>} - FCM response
 */
const sendFCMNotification = async (token, notification) => {
  try {
    const fcmServerKey = process.env.FCM_SERVER_KEY;

    if (!fcmServerKey) {
      console.warn('FCM_SERVER_KEY not configured. Skipping push notification.');
      return { success: false, message: 'FCM not configured' };
    }

    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: token,
        notification: {
          title: notification.title,
          body: notification.message,
          sound: 'default',
          priority: 'high'
        },
        data: notification.data || {},
        priority: 'high'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${fcmServerKey}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('FCM send error:', error.message);
    throw error;
  }
};

/**
 * Send push notification to a user (all their active devices)
 * @param {string} userId - User ID
 * @param {object} notification - Notification object
 * @param {string} notification.type - Notification type
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification body
 * @param {object} notification.data - Additional data
 */
const sendNotificationToUser = async (userId, notification) => {
  try {
    // Get all active device tokens for the user
    const deviceTokens = await DeviceToken.find({ userId, isActive: true });

    if (deviceTokens.length === 0) {
      console.log(`No active devices for user ${userId}`);
      return { success: false, message: 'No active devices' };
    }

    const results = [];

    for (const deviceToken of deviceTokens) {
      try {
        let response;

        if (deviceToken.platform === 'android') {
          response = await sendFCMNotification(deviceToken.token, notification);
        } else if (deviceToken.platform === 'ios') {
          // For iOS, also use FCM or implement APNs
          response = await sendFCMNotification(deviceToken.token, notification);
        }

        // Update device token last notification time
        deviceToken.lastNotificationSent = new Date();
        deviceToken.failedAttempts = 0;
        await deviceToken.save();

        results.push({ deviceId: deviceToken._id, success: true, response });
      } catch (error) {
        console.error(`Failed to send to device ${deviceToken._id}:`, error.message);
        
        // Increment failed attempts
        deviceToken.failedAttempts += 1;
        
        // Deactivate token after 5 failed attempts
        if (deviceToken.failedAttempts >= 5) {
          deviceToken.isActive = false;
        }
        
        await deviceToken.save();

        results.push({ deviceId: deviceToken._id, success: false, error: error.message });
      }
    }

    // Log notification
    await NotificationLog.create({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      deliveryStatus: results.some(r => r.success) ? 'sent' : 'failed',
      deliveryResponse: results,
      channel: 'push',
      outingId: notification.outingId || null,
      readingId: notification.readingId || null,
      cumulativeDoseAtNotification: notification.cumulativeDose || null,
      medThreshold: notification.medThreshold || null,
      currentUVI: notification.currentUVI || null
    });

    return { success: true, results };
  } catch (error) {
    console.error('Send notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send reapply reminder notification
 * @param {string} userId - User ID
 * @param {object} data - Additional data (outingId, readingId, etc.)
 */
const sendReapplyReminder = async (userId, data = {}) => {
  return await sendNotificationToUser(userId, {
    type: 'reapply_reminder',
    title: 'Sunscreen Reminder',
    message: "It's time to reapply sunscreen or seek shade",
    data,
    outingId: data.outingId,
    readingId: data.readingId,
    cumulativeDose: data.cumulativeDose,
    medThreshold: data.medThreshold,
    currentUVI: data.currentUVI
  });
};

/**
 * Send initial reminder notification
 * @param {string} userId - User ID
 */
const sendInitialReminder = async (userId) => {
  return await sendNotificationToUser(userId, {
    type: 'initial_reminder',
    title: 'Sunscreen Reminder',
    message: 'Please wear sunscreen at least 20mins prior to going out',
    data: {}
  });
};

module.exports = {
  sendFCMNotification,
  sendNotificationToUser,
  sendReapplyReminder,
  sendInitialReminder
};


