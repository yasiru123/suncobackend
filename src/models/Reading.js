const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  outingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outing',
    default: null,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  // UV Index value at the time of reading
  uvi: {
    type: Number,
    required: true,
    min: 0,
    max: 15 // UVI typically ranges 0-11+, but can exceed
  },
  // Location coordinates
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  // Dose calculation: ΔDose (J/m²) = UVI * 0.025 * Δt
  // where Δt is time interval in seconds since last reading
  doseIncrement: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Cumulative dose at this point in the outing (J/m²)
  cumulativeDose: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Time interval from previous reading (seconds)
  intervalSeconds: {
    type: Number,
    default: 0
  },
  // Whether this reading triggered a notification
  triggeredNotification: {
    type: Boolean,
    default: false
  },
  // Source of the reading (app foreground, background fetch, server)
  source: {
    type: String,
    enum: ['foreground', 'background', 'server', 'manual'],
    default: 'foreground'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
readingSchema.index({ userId: 1, timestamp: -1 });
readingSchema.index({ outingId: 1, timestamp: 1 });

module.exports = mongoose.model('Reading', readingSchema);


