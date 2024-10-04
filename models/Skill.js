const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Skill name
  description: { 
    type: String, 
    required: false 
  }, // Optional: Description of the skill
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true // Ensure a skill is always associated with a department
  }, // Associate skill with a department
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], // Define skill proficiency levels
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now // When the skill was created
  },
  updatedAt: { 
    type: Date, 
    default: Date.now // When the skill was last updated
  },
});

// Update `updatedAt` before saving
skillSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;
