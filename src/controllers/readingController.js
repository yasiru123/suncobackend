const Reading = require('../models/Reading');
const Outing = require('../models/Outing');
const User = require('../models/User');

/**
 * @route   POST /api/readings
 * @desc    Create a new UVI reading with dose calculation
 * @access  Private
 */
const createReading = async (req, res) => {
  try {
    const {
      uvi,
      latitude,
      longitude,
      timestamp,
      doseIncrement,
      cumulativeDose,
      intervalSeconds,
      source,
      outingId
    } = req.body;

    const userId = req.userId;

    // Find user to get current outing
    const user = await User.findById(userId);
    const activeOutingId = outingId || user.currentOutingId;

    // Create the reading
    const reading = new Reading({
      userId,
      outingId: activeOutingId,
      timestamp: timestamp || new Date(),
      uvi,
      latitude,
      longitude,
      doseIncrement: doseIncrement || 0,
      cumulativeDose,
      intervalSeconds: intervalSeconds || 0,
      source: source || 'foreground',
      triggeredNotification: false
    });

    await reading.save();

    // Update outing if active
    if (activeOutingId) {
      const outing = await Outing.findById(activeOutingId);
      if (outing) {
        // Update outing cumulative dose and peak UVI
        outing.totalCumulativeDose = cumulativeDose;
        if (uvi > outing.peakUVI) {
          outing.peakUVI = uvi;
        }
        
        // Check if MED threshold reached
        if (cumulativeDose >= outing.medThreshold && !outing.medThresholdReached) {
          outing.medThresholdReached = true;
          reading.triggeredNotification = true;
          await reading.save();
        }

        // Set actual start time if not set
        if (!outing.actualStartTime && outing.status === 'planned') {
          outing.actualStartTime = timestamp || new Date();
          outing.status = 'active';
        }

        await outing.save();
      }
    }

    res.status(201).json({
      success: true,
      data: { reading },
      message: 'Reading created successfully'
    });
  } catch (error) {
    console.error('Create reading error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating reading'
    });
  }
};

/**
 * @route   GET /api/readings
 * @desc    Get readings for a user with optional filters
 * @access  Private
 */
const getReadings = async (req, res) => {
  try {
    const userId = req.userId;
    const { from, to, outingId, limit = 100, page = 1 } = req.query;

    // Build query
    const query = { userId };

    if (outingId) {
      query.outingId = outingId;
    }

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const readings = await Reading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('outingId', 'plannedStartTime status');

    // Get total count for pagination
    const total = await Reading.countDocuments(query);

    res.json({
      success: true,
      data: {
        readings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching readings'
    });
  }
};

/**
 * @route   GET /api/readings/:id
 * @desc    Get a single reading by ID
 * @access  Private
 */
const getReading = async (req, res) => {
  try {
    const reading = await Reading.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('outingId');

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found'
      });
    }

    res.json({
      success: true,
      data: { reading }
    });
  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching reading'
    });
  }
};

/**
 * @route   GET /api/readings/stats
 * @desc    Get reading statistics for a user
 * @access  Private
 */
const getReadingStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { from, to } = req.query;

    const matchStage = { userId };
    if (from || to) {
      matchStage.timestamp = {};
      if (from) matchStage.timestamp.$gte = new Date(from);
      if (to) matchStage.timestamp.$lte = new Date(to);
    }

    const stats = await Reading.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReadings: { $sum: 1 },
          averageUVI: { $avg: '$uvi' },
          maxUVI: { $max: '$uvi' },
          totalDose: { $sum: '$doseIncrement' },
          notificationCount: {
            $sum: { $cond: ['$triggeredNotification', 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalReadings: 0,
          averageUVI: 0,
          maxUVI: 0,
          totalDose: 0,
          notificationCount: 0
        }
      }
    });
  } catch (error) {
    console.error('Get reading stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching statistics'
    });
  }
};

module.exports = {
  createReading,
  getReadings,
  getReading,
  getReadingStats
};


