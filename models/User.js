const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
  employeeID: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, default: 'Admin' }, // Designation field

  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  certifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certification' }],
  points: { type: Number, default: 0 }, // Points earned from courses and certifications
  isVerified: { type: Boolean, default: false }, // For admin approval of user actions
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // New features integration
  progressHistory: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    progress: {
      type: Number,
      default: 0, // Progress in percentage
    },
    score: {
      type: Number,
      default: 0, // Assessment score
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  specializations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
  }],
});


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
