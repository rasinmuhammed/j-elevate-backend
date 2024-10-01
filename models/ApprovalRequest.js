const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['Certification', 'Skill'], required: true }, // Type of item being approved
  item: { type: mongoose.Schema.Types.ObjectId, required: true }, // The certification or skill being approved
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ApprovalRequest = mongoose.model('ApprovalRequest', approvalRequestSchema);
module.exports = ApprovalRequest;
