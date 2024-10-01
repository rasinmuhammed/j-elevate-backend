const mongoose = require('mongoose');
const Department = require('./models/Department'); // Adjust the path as necessary

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/j-elevate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected...');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Departments data with hierarchical roles
const departmentsData = [
  {
    name: 'Data Engineering',
    roles: [
      { title: 'Senior Data Engineer', level: 'Senior' },
      { title: 'Data Engineer', level: 'Mid-Level' },
      { title: 'Junior Data Engineer', level: 'Junior' },
      { title: 'ETL Developer', level: 'Mid-Level' },
      { title: 'Data Architect', level: 'Senior' },
    ],
  },
  {
    name: 'Data Science',
    roles: [
      { title: 'Senior Data Scientist', level: 'Senior' },
      { title: 'Data Scientist', level: 'Mid-Level' },
      { title: 'Junior Data Scientist', level: 'Junior' },
      { title: 'Machine Learning Engineer', level: 'Mid-Level' },
      { title: 'Data Analyst', level: 'Junior' },
    ],
  },
  {
    name: 'Full Stack Development',
    roles: [
      { title: 'Senior Full Stack Developer', level: 'Senior' },
      { title: 'Full Stack Developer', level: 'Mid-Level' },
      { title: 'Junior Full Stack Developer', level: 'Junior' },
      { title: 'Frontend Developer', level: 'Mid-Level' },
      { title: 'Backend Developer', level: 'Mid-Level' },
    ],
  },
  {
    name: 'Core Consulting',
    roles: [
      { title: 'Senior Business Analyst', level: 'Senior' },
      { title: 'Business Analyst', level: 'Mid-Level' },
      { title: 'Junior Business Analyst', level: 'Junior' },
      { title: 'Management Consultant', level: 'Mid-Level' },
      { title: 'Strategy Consultant', level: 'Senior' },
    ],
  },
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing departments
    await Department.deleteMany({});
    console.log('Existing departments cleared.');

    // Insert new departments
    const result = await Department.insertMany(departmentsData);
    console.log('Departments seeded:', result);
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seeding function
seedDatabase();
