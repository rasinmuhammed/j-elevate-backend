const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  score: { type: Number, default: 0 }, // Certification score for points
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Certification tied to a department
  isVerified: { type: Boolean, default: false }, // Admin approval for the certification
  createdAt: { type: Date, default: Date.now },
});

const Certification = mongoose.model('Certification', certificationSchema);
module.exports = Certification;
