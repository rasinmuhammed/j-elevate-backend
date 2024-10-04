const User = require('../models/User'); // Corrected model name
const { createJWTToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

// Login controller
exports.loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    // Create JWT token
    const token = createJWTToken(user._id, user.role);

    // Send token and role in the response
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000, // 1 hour
    });

    // Send the role along with the token in the response
    res.status(200).json({
      message: 'Login successful',
      token: token,
      role: user.role, // Include the role in the response
      id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout controller
exports.logoutController = (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.status(200).json({ message: 'Logged out successfully' });
};
