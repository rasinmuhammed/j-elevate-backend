const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');

// Endpoint for gathering dashboard statistics
router.get('/', async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments();
    const totalCourses = await Course.countDocuments();

    // Average points calculation
    const employees = await User.find();
    const totalPoints = employees.reduce((sum, emp) => sum + emp.points, 0);
    const averagePoints = (totalPoints / totalEmployees).toFixed(2);

    // Finding the top employee
    const topEmployees = employees
      .sort((a, b) => b.points - a.points) // Sort employees by points in descending order
      .slice(0, 5) // Get top 5 performers
      .map(emp => ({
        name: `${emp.firstName} ${emp.lastName}`,
        role: emp.role,
        points: emp.points,
      }));

    // Employee Points Distribution
    const employeePointsDistribution = employees.map(emp => ({
      employeeName: `${emp.firstName} ${emp.lastName}`,
      points: emp.points,
    }));

    // Department-wise performance
    const departmentPerformance = {};
    employees.forEach(emp => {
      const department = emp.department ? emp.department.name : 'Unassigned';
      if (!departmentPerformance[department]) {
        departmentPerformance[department] = {
          totalPoints: 0,
          totalEmployees: 0,
        };
      }
      departmentPerformance[department].totalPoints += emp.points;
      departmentPerformance[department].totalEmployees++;
    });

    const departmentWisePerformance = Object.entries(departmentPerformance).map(([department, data]) => ({
      department,
      averagePoints: (data.totalPoints / data.totalEmployees).toFixed(2),
    }));

    res.json({
      totalEmployees,
      totalCourses,
      averagePoints,
      topEmployees,
      employeePointsDistribution,
      departmentWisePerformance,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
