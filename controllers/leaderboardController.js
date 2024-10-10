const User = require('../models/User');
const Department = require('../models/Department');

const getLeaderboard = async (req, res) => {
  try {
    // Fetch departments with user scores aggregated by department
    const departments = await Department.find({}).populate('roles'); // Fetch all departments

    // Get users by department and calculate total scores
    const departmentScores = await Promise.all(
      departments.map(async (dept) => {
        const users = await User.find({ department: dept._id });

        // Calculate total scores of users in the department
        const totalScore = users.reduce((acc, user) => acc + (user.points || 0), 0);

        // Get top performers (sorted by points)
        const topPerformers = users
          .sort((a, b) => b.points - a.points)
          .slice(0, 3); // Top 3 performers

        return {
          departmentName: dept.name,
          totalScore,
          topPerformers: topPerformers.map((user) => ({
            name: `${user.firstName} ${user.lastName}`,
            score: user.points,
            role: user.role,
          })),
        };
      })
    );

    res.json(departmentScores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
};

module.exports = { getLeaderboard };
