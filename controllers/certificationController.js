const Certification = require('../models/Certification');

// Get all certifications for a user
// Get all certifications for a user
exports.getUserCertifications = async (req, res) => {
    try {
      const userId = req.user.id; // Assume user ID is in the token payload
      const certifications = await Certification.find({ userId })
        .populate('courseId', 'course') // Populate the courseId field, selecting only the 'course' field
        .exec();
  
      res.status(200).json(certifications);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      res.status(500).json({ message: 'Failed to load certifications.' });
    }
  };
  