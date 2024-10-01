const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Course = require('./models/Course'); // Adjust the import based on your structure

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

const csvFilePath = path.join(__dirname, 'Coursera.csv'); // Adjust the path if necessary

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', async (row) => {
    try {
      // Handle the skills field
      let skills = row.skills;
      if (skills === "None" || !skills) {
        skills = []; // Default to an empty array
      } else {
        // Transform the skills string into valid JSON
        skills = skills
          .replace(/^{/, '[')    // Replace the opening brace with an opening bracket
          .replace(/}$/, ']')    // Replace the closing brace with a closing bracket
          .replace(/"/g, '')     // Remove the extra quotes
          .replace(/,/g, '", "') // Replace commas with `", "` for valid JSON strings
          .replace(/^\[/, '["')  // Add an opening quote for the first item
          .replace(/\]$/, '"]'); // Add a closing quote for the last item

        // Attempt to parse the transformed skills string
        try {
          skills = JSON.parse(skills);
        } catch (parseError) {
          console.error(`Error parsing skills: ${skills}. Defaulting to empty array.`);
          skills = [];
        }
      }

      // Extract fields from the row and create a new Course document
      const courseData = {
        partner: row.partner,
        course: row.course,
        skills: skills, // Use the parsed skills
        rating: parseFloat(row.rating) || 0,
        reviewcount: parseInt(row.reviewcount.replace(/,/g, ''), 10) || 0, // Handle commas
        level: row.level,
        certificatetype: row.certificatetype,
        duration: row.duration,
        crediteligibility: row.crediteligibility === 'TRUE',
      };

      // Save the course to the database
      const course = new Course(courseData);
      await course.save();
      console.log('Course saved:', course);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });
