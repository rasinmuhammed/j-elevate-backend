// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  partner: { type: String, required: true },
  course: { type: String, required: true },
  skills: [{ type: String }], // Skills related to the course
  rating: { type: Number, default: 0 }, // Course rating
  reviewCount: { type: Number, default: 0 }, // Number of reviews
  level: { type: String,  enum: ['Beginner', 'Intermediate ', 'Advanced','Mixed'] },
  certificateType: { type: String, enum: ['Specialization', 'Professional Certificate', 'Guided Project', 'Course'] }, // Professional or others
  duration: { type: String }, // Course duration
  creditEligibility: { type: Boolean, default: false }, // Credit eligibility
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
