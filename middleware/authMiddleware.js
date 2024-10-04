const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Check for token in both cookies and headers

  if (!token) {
    return res.status(401).json({ message: 'A token is required for authentication' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT secret is not set in environment variables');
    return res.status(500).json({ message: 'Internal server error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user info to the request
    next(); // Call the next middleware
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    console.error('Token verification error:', err.message); // Log error message
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
