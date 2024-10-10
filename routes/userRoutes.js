const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Import your middleware
const userController = require('../controllers/userController');
const certificationController = require('../controllers/certificationController');

// Apply the verifyToken middleware to the routes that need protection
router.use(verifyToken); // Middleware is applied to all routes below this line

// Define your routes here
router.post('/add-course', userController.addCourseToLearningBucket);
router.put('/update-course/:courseId', userController.updateCourseProgress);
router.patch('/mark-complete/:courseId', userController.markCourseAsComplete);
router.post('/submit/:courseId', userController.submitToSupervisor);
router.get('/scores', userController.viewScores);
router.get('/learning-bucket', userController.getLearningBucket);
router.get('/skills', userController.getUserSkills);
router.get('/skillsdep', userController.getSkillsByDepartment);
router.patch('/mark-complete/:courseId', userController.markCourseAsComplete);
router.post('/submit/:courseId', userController.submitToSupervisor);
router.get('/certifications', certificationController.getUserCertifications);
// Fetch the user profile information
router.get('/profile', userController.getUserProfile);
router.get('/recommendations/:employeeId', userController.getRecommendations);

module.exports = router;
