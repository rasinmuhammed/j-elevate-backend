const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, required: true }, // e.g., "Senior", "Mid-Level", "Junior"
});

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roles: [roleSchema], // List of roles within this department with hierarchy
  createdAt: { type: Date, default: Date.now },
});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
