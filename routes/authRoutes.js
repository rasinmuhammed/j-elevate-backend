const express = require('express');
const { loginController, logoutController } = require('../controllers/authController');
const router = express.Router();

// Login route
router.post('/login', loginController);

// Logout route
router.post('/logout', logoutController);

module.exports = router;
