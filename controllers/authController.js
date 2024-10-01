const User = require('../models/User'); // Corrected model name
const { createJWTToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

// Login controller
exports.loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Email' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    console.log('Input Password:', password);
    console.log('Stored Hashed Password:', user.password);
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Create JWT token
    const token = createJWTToken(user._id, user.role);

    // Send token in a secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
      sameSite: 'Strict',
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout controller
exports.logoutController = (req, res) => {
  res.clearCookie('token'); // Clear the token cookie
  res.status(200).json({ message: 'Logged out successfully' });
};
