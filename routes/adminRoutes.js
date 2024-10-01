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
    getEmployeeDetails

} = require('../controllers/adminController');
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');
const Department = require('../models/Department'); // Correct import paths if necessary

// Configure CSV writer
const csvWriter = createObjectCsvWriter({
  path: 'employee_passwords.csv',
  header: [
    { id: 'employeeID', title: 'Employee ID' },
    { id: 'email', title: 'Email' },
    { id: 'password', title: 'Password' },
  ],
});

// Utility function to generate an Employee ID
const generateEmployeeID = () => 'EMP' + Math.random().toString(36).substr(2, 9).toUpperCase();

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

module.exports = router;
