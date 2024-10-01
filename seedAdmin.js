const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); // Your User model

dotenv.config(); // Load environment variables

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Function to seed the default admin
const seedAdmin = async () => {
  try {
    // Check if an admin already exists
    const adminExists = await User.findOne({ email: 'admin@company.com' });
    if (adminExists) {
      console.log('Admin already exists.');
      return;
    }

    // Hash the admin password before saving
    const hashedPassword = 'Admin1234';

    // Create a new admin user
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@company.com', // Default admin email
      password: hashedPassword,     // Hashed password
      role: 'admin',
      employeeID: 'ADMIN001',       // Unique admin employee ID
      department: null,              // Assuming no department for admin
      designation: 'Admin',          // Default designation
    });

    await admin.save(); // Save admin to the database
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close(); // Close connection after seeding
  }
};

seedAdmin();
