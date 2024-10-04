const mongoose = require('mongoose');
const Skill = require('./models/Skill'); // Adjust the path as necessary
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

// Skills data
const skillsData = [
  // Data Engineering Skills
  { name: 'Data Warehousing', description: 'Techniques for collecting and managing data from various sources.', department: 'Data Engineering', level: 'Advanced' },
  { name: 'ETL Processes', description: 'Extract, Transform, Load processes for data integration.', department: 'Data Engineering', level: 'Intermediate' },
  { name: 'Data Modeling', description: 'Designing data structures and databases.', department: 'Data Engineering', level: 'Advanced' },
  { name: 'Big Data Technologies', description: 'Technologies like Hadoop and Spark.', department: 'Data Engineering', level: 'Intermediate' },

  // Data Science Skills
  { name: 'Machine Learning', description: 'Algorithms that allow computers to learn from data.', department: 'Data Science', level: 'Advanced' },
  { name: 'Statistical Analysis', description: 'Using statistical methods to analyze data.', department: 'Data Science', level: 'Intermediate' },
  { name: 'Data Visualization', description: 'Representing data graphically.', department: 'Data Science', level: 'Intermediate' },
  { name: 'Natural Language Processing', description: 'Techniques for analyzing human language.', department: 'Data Science', level: 'Advanced' },

  // Full Stack Development Skills
  { name: 'React.js', description: 'JavaScript library for building user interfaces.', department: 'Full Stack Development', level: 'Intermediate' },
  { name: 'Node.js', description: 'JavaScript runtime built on Chrome\'s V8 engine.', department: 'Full Stack Development', level: 'Intermediate' },
  { name: 'RESTful APIs', description: 'Architectural style for designing networked applications.', department: 'Full Stack Development', level: 'Advanced' },
  { name: 'Database Management', description: 'Skills in SQL and NoSQL databases.', department: 'Full Stack Development', level: 'Intermediate' },

  // Core Consulting Skills
  { name: 'Project Management', description: 'Skills in planning and executing projects.', department: 'Core Consulting', level: 'Advanced' },
  { name: 'Business Strategy', description: 'Formulating strategies for business growth.', department: 'Core Consulting', level: 'Advanced' },
  { name: 'Stakeholder Engagement', description: 'Managing relationships with stakeholders.', department: 'Core Consulting', level: 'Intermediate' },
  { name: 'Market Research', description: 'Skills in analyzing market conditions.', department: 'Core Consulting', level: 'Intermediate' },
];

// Seed the database
const seedSkills = async () => {
  try {
    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Existing skills cleared.');

    // Fetch departments to map their names to ObjectIds
    const departments = await Department.find({});
    const departmentMap = {};
    departments.forEach(department => {
      departmentMap[department.name] = department._id;
    });

    // Map skills to their respective department ObjectIds
    const mappedSkills = skillsData.map(skill => ({
      ...skill,
      department: departmentMap[skill.department] // Set department to the corresponding ObjectId
    }));

    // Insert new skills
    const result = await Skill.insertMany(mappedSkills);
    console.log('Skills seeded:', result);
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seeding function
seedSkills();
