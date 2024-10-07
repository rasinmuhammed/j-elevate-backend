const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');


// Route to get user certifications
router.get('/',certificationController.getUserCertifications);

module.exports = router;
