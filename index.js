const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes.js');
const certificationRoutes = require('./routes/certificationRoutes.js');
const cors = require('cors'); // Import CORS middleware
const cookieParser = require('cookie-parser');
const Certification = require('./models/Certification.js');
const statisticsRoute = require('./routes/statistics');

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3001', // Allow requests from your React app's origin
  credentials: true, // Allow credentials (e.g., cookies)
}));

// Connect to MongoDB
connectDB();

// Use authentication routes
// Use authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/statistics', statisticsRoute);



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
