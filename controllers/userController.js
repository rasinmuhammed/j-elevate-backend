const User = require('../models/User'); // Import the User model
const Skill = require('../models/Skill');
const Course = require('../models/Course');
const { PythonShell } = require('python-shell');

// Add a course to the learning bucket
exports.addCourseToLearningBucket = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id; // Use req.user._id instead of localStorage

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' } );

    // Check if the course is already in the learning bucket
    const courseExists = user.courses.find(course => course.courseId.toString() === courseId);
    if (courseExists) {
      return res.status(400).json({ message: 'Course already exists in the learning bucket' });
    }

    // Add the course to the user's courses array
    user.courses.push({ courseId, progress: 0, type: 'Course' });
    await user.save();

    return res.status(200).json({ message: 'Course added to your learning bucket' });
  } catch (error) {
    console.error('Error adding course:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update course progress
exports.updateCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const { progress } = req.body;
  const userId = req.user.id; // Use req.user._id instead of localStorage

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const course = user.courses.find(course => course.courseId.toString() === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found in learning bucket' });

    // Update the progress
    course.progress = progress;
    await user.save();

    return res.status(200).json({ message: 'Course progress updated successfully' });
  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark course as complete
exports.markCourseAsComplete = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id; // Use req.user._id instead of localStorage

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const course = user.courses.find(course => course.courseId.toString() === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found in learning bucket' });

    // Mark course as complete
    course.completionDate = new Date();
    await user.save();

    return res.status(200).json({ message: 'Course marked as complete' });
  } catch (error) {
    console.error('Error marking course as complete:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit course to supervisor
exports.submitToSupervisor = async (req, res) => {
    const { courseId } = req.params;
    const { score, selectedSkills, completionDate } = req.body; // Include completionDate from request body
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const course = user.courses.find(course => course.courseId.toString() === courseId);
        if (!course) return res.status(404).json({ message: 'Course not found in learning bucket' });

        // Assign score to the course record
        course.score = score;
        // Assign the completion date to the course
        course.completionDate = completionDate; // Update completionDate here

        // Add each selected skill to the user if not already present
        if (Array.isArray(selectedSkills)) {
            selectedSkills.forEach(skill => {
                if (!user.skills.includes(skill)) {
                    user.skills.push(skill);
                }
            });
        }

        // Logic to submit the course for supervisor review (e.g., notify admin)
        await user.save(); // Save user updates

        return res.status(200).json({ message: 'Course submitted to supervisor successfully' });
    } catch (error) {
        console.error('Error submitting course:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

  
// View scores
exports.viewScores = async (req, res) => {
  const userId = req.user.id; // Use req.user._id instead of localStorage

  try {
    const user = await User.findById(userId).populate('courses.courseId', 'score'); // Populate the courseId to get the score
    if (!user) return res.status(404).json({ message: 'User not found' });

    const scores = user.courses.map(course => ({
      courseId: course.courseId,
      score: course.score,
      progress: course.progress,
      isVerified: course.isVerified,
      completionDate: course.completionDate
    }));

    return res.status(200).json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get learning bucket
// Get learning bucket
exports.getLearningBucket = async (req, res) => {
    try {
      const userId = req.user.id; // Ensure user ID comes from JWT payload
  
      // Fetch user and populate the courses (assuming user has a 'courses' array)
      const user = await User.findById(userId).populate('courses.courseId');
      
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.status(200).json({ courses: user.courses }); // Return the courses array
    } catch (error) {
      console.error('Error fetching learning bucket:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Get user skills by department
  exports.getSkillsByDepartment = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from decoded token
        const user = await User.findById(userId).populate('department'); // Assuming department is a reference in User model
  
        if (!user || !user.department) {
            return res.status(404).json({ message: 'User or department not found' });
        }
  
        // Fetch skills for the user's department and populate the department name
        const skills = await Skill.find({ department: user.department._id }).populate('department', 'name');
  
        // Format skills to include department name
        const formattedSkills = skills.map(skill => ({
            id: skill._id,
            name: skill.name,
            description: skill.description,
            level: skill.level,
            departmentName: user.department.name // Add department name
        }));

        res.status(200).json(formattedSkills); // Return formatted skills as a response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user skills
exports.getUserSkills = async (req, res) => {
    console.log('Authenticated user:', req.user); // Check if req.user has the expected structure

  const userId = req.user.id; // Use req.user._id instead of localStorage

  try {
    const user = await User.findById(userId).populate('skills.skillId', 'name description level'); // Populate the skills field if it's a reference
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skills = user.skills; // Assuming skills is an array in the user model
    return res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update course progress
exports.updateCourseProgress = async (req, res) => {
    const { courseId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    console.log('Request data:', { userId, courseId, progress }); // Log the incoming request data

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const course = user.courses.find(course => course.courseId.toString() === courseId);
        if (!course) return res.status(404).json({ message: 'Course not found in learning bucket' });

        // Validate progress value
        if (progress < 0 || progress > 100) {
            return res.status(400).json({ message: 'Progress must be between 0 and 100' });
        }

        // Update progress
        course.progress = progress;
        console.log('User ID:', userId);
        console.log('Course ID:', courseId);
        console.log('Progress:', progress);
        console.log('User found:', user);
        console.log('Course in user:', course);

        await user.save();

        return res.status(200).json({ message: 'Course progress updated successfully' });
    } catch (error) {
        console.error('Error updating progress:', error.stack);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getVerifiedCourses = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming user ID is available in req.user after authentication
      const user = await User.findById(userId).populate('courses.courseId'); // Populate course details
  
      // Filter out the verified courses
      const verifiedCourses = user.courses.filter(course => course.isVerified);
  
      return res.status(200).json(verifiedCourses);
    } catch (error) {
      console.error('Error fetching verified courses:', error);
      return res.status(500).json({ message: 'Server Error' });
    }
  };


  exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the token payload
        // Populate the department field to get the department details
        const user = await User.findById(userId)
            .populate('department', 'name') // Specify the fields you want from the department
            .select('-password'); // Exclude the password

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if department exists and send user data back to client
        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            department: user.department ? user.department.name : null, // Safely access department name
            employeeID: user.employeeID,
            points: user.points,
            designation: user.designation,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


  // Get user skills
exports.getUserSkills = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).populate('skills');
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const skills = user.skills; // Assuming skills is an array in the user model
      return res.status(200).json(skills);
    } catch (error) {
      console.error('Error fetching user skills:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  



 
  
  // ... (your other controller functions: addCourseToLearningBucket, etc.) ...
   
  exports.getRecommendations = async (req, res) => {
    try {
      const employeeId = req.params.employeeId;
  
      // --- Call the Python Recommendation Script ---
      let options = {
        mode: 'text',
        pythonPath: 'python', // Path to your Python executable
        pythonOptions: ['-u'], // Unbuffered output
        scriptPath: '',
        args: [employeeId]
      };
  
      PythonShell.run('hybridModel.py', options, function (err, results) {
        if (err) {
          console.error('Error running Python script:', err);
          return res.status(500).json({ error: 'Failed to get recommendations' });
        }
  
        // Parse the JSON output from the Python script
        let recommendations = JSON.parse(results[0])
        console.log("Recommendations from Python:", recommendations);
  
        res.json(recommendations); // Send recommendations directly as JSON
      });
  
    } catch (error) {
      console.error('Error in /recommendations endpoint:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  };