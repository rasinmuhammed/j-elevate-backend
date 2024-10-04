const Course = require('../models/Course');

// Fetch all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Add a new course
const addCourse = async (req, res) => {
  const { partner, course, skills, rating, reviewcount, level, certificatetype, duration, crediteligibility } = req.body;

  if (!partner || !course) {
    return res.status(400).json({ message: 'Partner and Course fields are required' });
  }

  try {
    const newCourse = new Course({
      partner,
      course,
      skills: skills.split(','), // Assuming skills are provided as comma-separated values
      rating,
      reviewcount,
      level,
      certificatetype,
      duration,
      crediteligibility,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error adding course' });
  }
};

// Update a course
const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course' });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' });
  }
};

module.exports = {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
};
