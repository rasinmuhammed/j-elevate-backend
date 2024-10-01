const jwt = require('jsonwebtoken');

// Function to create JWT Token
exports.createJWTToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};
