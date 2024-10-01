const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputFile = 'Coursera.csv'; // Replace with your input CSV file path
const outputFile = 'Fixed_Coursera.csv'; // Replace with your desired output CSV file path

const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
        { id: 'partner', title: 'partner' },
        { id: 'course', title: 'course' },
        { id: 'skills', title: 'skills' },
        { id: 'rating', title: 'rating' },
        { id: 'reviewcount', title: 'reviewcount' },
        { id: 'level', title: 'level' },
        { id: 'certificatetype', title: 'certificatetype' },
        { id: 'duration', title: 'duration' },
        { id: 'crediteligibility', title: 'crediteligibility' },
    ]
});

const fixedCourses = [];

fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
        const skillsArray = row.skills
            .replace(/\{\s*"/g, '["') // Replace "{ \"" with "[\""
            .replace(/"\s*\}/g, '"]') // Replace "\" }" with "\"]"
            .replace(/"\s*,\s*"/g, '", "') // Ensure proper spacing
            .replace(/"{/g, '[') // Convert to array syntax
            .replace(/}"/g, ']') // Convert to array syntax
            .replace(/"{/g, '[') // Convert to array syntax
            .replace(/"\s*,\s*"/g, '", "') // Fix any spaces around commas
            .replace(/\s*"/g, '"'); // Trim any spaces

        const fixedRow = {
            partner: row.partner,
            course: row.course,
            skills: skillsArray,
            rating: parseFloat(row.rating),
            reviewcount: parseInt(row.reviewcount.replace('k', '000').replace(' ', '')),
            level: row.level,
            certificatetype: row.certificatetype,
            duration: row.duration,
            crediteligibility: row.crediteligibility
        };

        fixedCourses.push(fixedRow);
    })
    .on('end', () => {
        csvWriter.writeRecords(fixedCourses)
            .then(() => {
                console.log('CSV file has been fixed and saved as', outputFile);
            });
    })
    .on('error', (error) => {
        console.error('Error reading the CSV file:', error);
    });
