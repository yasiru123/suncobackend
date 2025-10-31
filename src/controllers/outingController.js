const Outing = require('../models/Outing');
const User = require('../models/User');
const Reading = require('../models/Reading');

/**
 * @route   POST /api/outings
 * @desc    Create a new outing
 * @access  Private
 */
const createOuting = async (req, res) => {
  try {
    const { plannedStartTime, startLocation, notes } = req.body;
    const userId = req.userId;

    // Get user's MED value
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create outing
    const outing = new Outing({
      userId,
      plannedStartTime,
      startLocation,
      notes,
      medThreshold: user.medValue,
      status: 'planned'
    });

    await outing.save();

    // Update user's current outing
    user.currentOutingId = outing._id;
    await user.save();

    res.status(201).json({
      success: true,
      data: { outing },
      message: 'Outing created successfully'
    });
  } catch (error) {
    console.error('Create outing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating outing'
    });
  }
};

/**
 * @route   GET /api/outings
 * @desc    Get all outings for a user
 * @access  Private
 */
const getOutings = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, limit = 50, page = 1 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const outings = await Outing.find(query)
      .sort({ plannedStartTime: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Outing.countDocuments(query);

    res.json({
      success: true,
      data: {
        outings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get outings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching outings'
    });
  }
};

/**
 * @route   GET /api/outings/:id
 * @desc    Get a single outing with readings
 * @access  Private
 */
const getOuting = async (req, res) => {
  try {
    const outing = await Outing.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!outing) {
      return res.status(404).json({
        success: false,
        error: 'Outing not found'
      });
    }

    // Get readings for this outing
    const readings = await Reading.find({ outingId: outing._id })
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      data: {
        outing,
        readings
      }
    });
  } catch (error) {
    console.error('Get outing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching outing'
    });
  }
};

/**
 * @route   PATCH /api/outings/:id/reapply
 * @desc    Record sunscreen reapplication (resets cumulative dose)
 * @access  Private
 */
const recordReapplication = async (req, res) => {
  try {
    const outing = await Outing.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!outing) {
      return res.status(404).json({
        success: false,
        error: 'Outing not found'
      });
    }

    // Add reapplication timestamp
    outing.reapplicationTimestamps.push(new Date());
    outing.reapplicationCount += 1;
    
    // Reset cumulative dose
    outing.totalCumulativeDose = 0;
    outing.medThresholdReached = false;

    await outing.save();

    res.json({
      success: true,
      data: { outing },
      message: 'Reapplication recorded. Cumulative dose reset to 0.'
    });
  } catch (error) {
    console.error('Record reapplication error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error recording reapplication'
    });
  }
};

/**
 * @route   PATCH /api/outings/:id/end
 * @desc    End an outing
 * @access  Private
 */
const endOuting = async (req, res) => {
  try {
    const outing = await Outing.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!outing) {
      return res.status(404).json({
        success: false,
        error: 'Outing not found'
      });
    }

    outing.endTime = new Date();
    outing.status = 'completed';
    await outing.save();

    // Clear user's current outing
    await User.findByIdAndUpdate(req.userId, { currentOutingId: null });

    res.json({
      success: true,
      data: { outing },
      message: 'Outing ended successfully'
    });
  } catch (error) {
    console.error('End outing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error ending outing'
    });
  }
};

/**
 * @route   GET /api/outings/active/current
 * @desc    Get the current active outing
 * @access  Private
 */
const getCurrentOuting = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || !user.currentOutingId) {
      return res.json({
        success: true,
        data: { outing: null },
        message: 'No active outing'
      });
    }

    const outing = await Outing.findById(user.currentOutingId);

    res.json({
      success: true,
      data: { outing }
    });
  } catch (error) {
    console.error('Get current outing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching current outing'
    });
  }
};

module.exports = {
  createOuting,
  getOutings,
  getOuting,
  recordReapplication,
  endOuting,
  getCurrentOuting
};


