const User = require('../models/User'); // Ensure to import your User model
const Department = require('../models/Department');

// Get all departments
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a new department
const addDepartment = async (req, res) => {
    const { name } = req.body;

    try {
        const existingDepartment = await Department.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        const newDepartment = new Department({ name, roles: [] });
        const savedDepartment = await newDepartment.save();
        res.status(201).json(savedDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Add a role to a department
const addRole = async (req, res) => {
    const { departmentId, role } = req.body;

    try {
        const department = await Department.findById(departmentId);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        // Check if the role already exists
        const roleExists = department.roles.some(r => r.title === role);
        if (roleExists) {
            return res.status(400).json({ message: 'Role already exists in this department' });
        }

        department.roles.push({ title: role, level: 'Junior' }); // Default level can be adjusted
        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Edit an existing department
const editDepartment = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedDepartment = await Department.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedDepartment) return res.status(404).json({ message: 'Department not found' });
        res.json(updatedDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Edit an existing role
const editRole = async (req, res) => {
    const { departmentId, roleIndex } = req.params;
    const { title, level } = req.body;

    try {
        const department = await Department.findById(departmentId);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        if (roleIndex < 0 || roleIndex >= department.roles.length) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Ensure no duplicate role titles within the same department
        const roleExists = department.roles.some((r, index) => r.title === title && index !== parseInt(roleIndex));
        if (roleExists) {
            return res.status(400).json({ message: 'Role with this title already exists' });
        }

        department.roles[roleIndex] = { title, level };
        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Function to get all employees with basic details
// Function to get all employees with basic details
const getAllEmployees = async (req, res) => {
    try {
        // Find users with role 'employee' and select specific fields
        const employees = await User.find({ role: 'employee' })
            .populate('department', 'name') // Populate department name
            .select('firstName lastName employeeID department designation points'); // Select only required fields
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Function to get employee progress
const getEmployeeProgress = async (req, res) => {
    try {
        const employees = await User.find().select('name department progress'); // Adjust based on your User model
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to get detailed employee info (including courses and skills)
const getEmployeeDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await User.findById(id)
            .populate('department', 'name')
            .populate('designation')
            .populate('courses') 
            .populate('skills');

        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee details:', error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
};

// Admin: Approve Certification
const approveCertification = async (req, res) => {
    const { courseId } = req.params;
    
    try {
      const user = await User.findOne({ "courses.courseId": courseId });
      if (!user) return res.status(404).json({ message: 'User or course not found' });
  
      const course = user.courses.find(course => course.courseId.toString() === courseId);
      course.isVerified = true;
      user.calculatePoints();
      await user.save();
  
      return res.status(200).json({ message: 'Course certification approved' });
    } catch (error) {
      console.error('Error approving certification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  


module.exports = {
    getDepartments,
    addDepartment,
    addRole,
    editDepartment,
    editRole, 
    getAllEmployees,
    getEmployeeProgress,
    getEmployeeDetails,
    approveCertification
};
