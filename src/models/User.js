const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    trim: true
  },
  skinType: {
    type: Number,
    min: 1,
    max: 6,
    required: true,
    // Type 1->225, Type 2->275, Type 3->350, Type 4->500, Type 5->700, Type 6->1000
  },
  // MED (Minimal Erythemal Dose) in J/m² based on skin type
  medValue: {
    type: Number,
    required: false
  },
  // Optional SPF factor for future use
  spf: {
    type: Number,
    default: 30,
    min: 1
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  // Current outing tracking
  currentOutingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outing',
    default: null
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Set MED value based on skin type
userSchema.pre('save', function(next) {
  if (this.isModified('skinType')) {
    const medMap = {
      1: 225,
      2: 275,
      3: 350,
      4: 500,
      5: 700,
      6: 1000
    };
    this.medValue = medMap[this.skinType] || 350;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);


