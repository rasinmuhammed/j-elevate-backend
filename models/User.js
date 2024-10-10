const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');
const Department = require('../models/Department.js');
const Skill = require('../models/Skill.js');


const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    match: /.+\@.+\..+/ // Simple email format validation
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
  employeeID: { type: String, required: true, unique: true }, // Ensure it's unique
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, default: 'Admin' },
  skills: [{ type: String }],
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Single array to track course progress
  courses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: { // Define the type of course taken
      type: String,
      enum: [' Specialization ', ' Professional ', ' Guided Project ', ' Course '],
      required: true,
    },
    progress: {
      type: Number,
      default: 0, // Progress percentage
    },
    score: {
      type: Number,
      default: 0, // Score earned in the course
    },
    completionDate: {
      type: Date,
      default: null, // Date when the course was completed
    },
    isVerified: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now, // Date when the course record was created
    },
  }],
});

// Pre-save hook to generate employeeID
userSchema.pre('save', async function (next) {
  if (!this.employeeID) { // Check if employeeID is not already set
    this.employeeID = await generateUniqueEmployeeID(this.firstName, this.lastName);
  }
  
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});


// Pre-save hook to calculate points
userSchema.pre('save', function (next) {
  if (this.isModified('courses')) {
    this.calculatePoints(); // Recalculate points if courses are modified
  }
  next();
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

// Scoring function based on course details
userSchema.methods.calculatePoints = function () {
  const pointsFromCourses = this.courses.reduce((total, course) => {
    // Initialize base points from the course score
    let coursePoints = course.score || 0; // Fallback to 0 if score is undefined

    // Define a mapping for course type points
    const courseTypePoints = {
      ' Specialization ': 25,
      ' Professional Certificate ': 15,
      ' Guided Project ': 20,
      ' Course ': 5,
    };

    // Add points based on course type, if it exists in the mapping
    coursePoints += courseTypePoints[course.type] || 0;

    // Define a mapping for course level points
    const courseLevelPoints = {
      'Beginner ': 10,
      'Intermediate ': 20,
      'Advanced ': 30,
      'Mixed ': 15,
    };

    // Add points based on course level, if it exists in the mapping
    coursePoints += courseLevelPoints[course.courseId.level] || 0;

    // Return the total points accumulated so far
    return total + coursePoints;
  }, 0);

  // Update total points for the user
  this.points = pointsFromCourses;
  return pointsFromCourses;
};


// Method to get user level based on points
userSchema.methods.getLevel = function () {
  if (this.points < 50) {
    return 'Novice';
  } else if (this.points < 100) {
    return 'Intermediate';
  } else if (this.points < 200) {
    return 'Advanced';
  } else {
    return 'Expert';
  }
};



const User = mongoose.model('User', userSchema);
module.exports = User;

