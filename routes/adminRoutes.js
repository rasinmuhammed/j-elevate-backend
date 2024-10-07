const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs');
const { createObjectCsvWriter } = require('csv-writer');
const {
  getDepartments,
  addDepartment,
  addRole,
  editDepartment,
  editRole,
  getAllEmployees,
    getEmployeeProgress,
    getEmployeeDetails,
  

} = require('../controllers/adminController');
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');
const Department = require('../models/Department'); 
const Skill = require('../models/Skill');
const Certification = require('../models/Certification')
// course routes
const { getAllCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courseController');


// Configure CSV writer
const csvWriter = createObjectCsvWriter({
  path: 'employee_passwords.csv',
  header: [
    { id: 'employeeID', title: 'Employee ID' },
    { id: 'email', title: 'Email' },
    { id: 'password', title: 'Password' },
  ],
});



// Define routes for departments and roles
router.get('/departments', getDepartments);
router.post('/add-department', addDepartment);
router.post('/add-role', addRole);
router.put('/edit-department/:id', editDepartment);
router.put('/edit-role/:departmentId/:roleIndex', editRole);



// Route for Bulk-upload
router.post('/bulk-upload', async (req, res) => {
  const { employees } = req.body;

  if (!employees || employees.length === 0) {
    return res.status(400).json({ message: 'No employees data provided' });
  }

  try {
    const departments = await Department.find();
    const departmentMap = departments.reduce((map, dept) => {
      map[dept.name] = dept._id;
      return map;
    }, {});

    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        if (!departmentMap[emp.department]) {
          throw new Error(`Department ${emp.department} not found`);
        }

        const hashedPassword = await bcrypt.hash(emp.password, 10);
        return {
          ...emp,
          department: departmentMap[emp.department], // Set department ObjectId
          password: hashedPassword, // Set hashed password
        };
      })
    );

    const savedEmployees = await User.insertMany(employeeData);
    return res.status(201).json(savedEmployees);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route for adding a single employee
router.post('/add', async (req, res) => {
    const { firstName, lastName, email, password, employeeID, department, designation } = req.body;
  
    if (!firstName || !lastName || !email || !password || !employeeID || !department || !designation) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const departmentEntry = await Department.findOne({ name: department }); // Fetch department ID
  
      if (!departmentEntry) {
        return res.status(404).json({ message: `Department ${department} not found` });
      }
  
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword, // Store hashed password
        employeeID,
        department: departmentEntry._id, // Set department ObjectId
        designation,
      });
  
      const savedUser = await newUser.save();
      return res.status(201).json(savedUser); // Respond with saved user data
    } catch (error) {
      return res.status(500).json({ message: error.message }); // Handle server error
    }
  });

  // Routes for viewing Employee Progress
  // Route to get all employees
router.get('/employees', getAllEmployees);

// Route to get employee progress
router.get('/employee-progress', getEmployeeProgress);

// Route to get specific employee details
router.get('/employee/:id', getEmployeeDetails);


// Define routes for managing courses
router.get('/courses', getAllCourses); // Fetch all courses
router.post('/courses', addCourse); // Add a new course
router.put('/courses/:id', updateCourse); // Edit a course
router.delete('/courses/:id', deleteCourse); // Delete a course

// Get all skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().populate('department');
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills' });
  }
});

// Create a new skill
router.post('/skills', async (req, res) => {
  const { name, description, level, department } = req.body;
  
  const newSkill = new Skill({
    name,
    description,
    level,
    department
  });

  try {
    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    res.status(400).json({ message: 'Error adding skill' });
  }
});

// Update an existing skill
router.put('/skills/:id', async (req, res) => {
  const { name, description, level, department } = req.body;

  try {
    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, {
      name,
      description,
      level,
      department
    }, { new: true });

    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(400).json({ message: 'Error updating skill' });
  }
});

// Delete a skill
router.delete('/skills/:id', async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting skill' });
  }
});

// Fetch pending requests
router.get('/pending-requests', async (req, res) => {
  try {
    const pendingRequests = await User.find({
      'courses.completionDate': { $ne: null },
      'courses.isVerified': false,
    }).populate('courses.courseId');

    const requests = pendingRequests.flatMap(user => {
      return user.courses
        .filter(course => course.completionDate && !course.isVerified)
        .map(course => ({
          _id: course._id,
          employee: { name: `${user.firstName} ${user.lastName}` },
          certificationName: course.courseId.course,
          score: course.score,
        }));
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or reject certification
router.post('/approve-certification', async (req, res) => {
  const { requestId, approve } = req.body;

  try {
      // Find the user request using requestId
      const userRequest = await User.findOne({ "courses._id": requestId });

      if (!userRequest) {
          return res.status(404).json({ message: 'Request not found' });
      }

      const course = userRequest.courses.id(requestId); // Get the course using requestId
      if (!course) {
          return res.status(404).json({ message: 'Course not found for this request' });
      }

      // Update the course's isVerified status
      course.isVerified = true; // Update the course's isVerified based on approval

      // Create a new certification regardless of approval status
      const newCertification = new Certification({
          userId: userRequest._id,
          courseId: course.courseId, // Assuming you have the courseId in the course object
          completionDate: course.completionDate, 
          isApproved: approve // Set isVerified based on approval
      });

      // Save the new certification
      await newCertification.save();

      // Save the user request changes
      await userRequest.save(); 

      // Send response
      res.status(200).json({ message: 'Certification request processed successfully' });
  } catch (error) {
      console.error('Error approving certification:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
