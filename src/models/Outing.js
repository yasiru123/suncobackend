const mongoose = require('mongoose');

const outingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // When user plans to go out or actually went out
  plannedStartTime: {
    type: Date,
    required: true
  },
  // Actual start time (when first reading was taken)
  actualStartTime: {
    type: Date,
    default: null
  },
  // End time of the outing
  endTime: {
    type: Date,
    default: null
  },
  // Status: planned, active, completed, cancelled
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned',
    index: true
  },
  // Starting location
  startLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  // Cumulative dose accumulated during this outing (J/m²)
  totalCumulativeDose: {
    type: Number,
    default: 0,
    min: 0
  },
  // MED value at the time of outing (snapshot from user)
  medThreshold: {
    type: Number,
    required: true
  },
  // Number of reapplications during this outing
  reapplicationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Timestamps of reapplications (when user pressed "I reapplied")
  reapplicationTimestamps: [{
    type: Date
  }],
  // Number of notifications sent during this outing
  notificationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Whether MED threshold was reached
  medThresholdReached: {
    type: Boolean,
    default: false
  },
  // Peak UVI during the outing
  peakUVI: {
    type: Number,
    default: 0
  },
  // Notes or description
  notes: {
    type: String,
    maxlength: 500
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

// Index for querying active outings
outingSchema.index({ userId: 1, status: 1, plannedStartTime: -1 });

module.exports = mongoose.model('Outing', outingSchema);


