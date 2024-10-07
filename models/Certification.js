const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // To link the certification to a user
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true, // To link the certification to a course
  },
  certificationLink: {
    type: String
  },
  certificateImage: {
    type: String
  },
  completionDate: {
    type: Date,
    default: Date.now, // The date when the course was completed
  },
  isApproved: {
    type: Boolean,
    default: false, // Whether the certification has been verified by an admin
  },
  createdAt: {
    type: Date,
    default: Date.now, // When the certification was added
  },
  updatedAt: {
    type: Date,
    default: Date.now, // For tracking updates
  },
});

// Pre-save hook to update `updatedAt` on any modification
certificationSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

const Certification = mongoose.model('Certification', certificationSchema);
module.exports = Certification;
