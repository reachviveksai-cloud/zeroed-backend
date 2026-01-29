const path = require('path')
const WorkExperience = require('../models/workExperience')

exports.verifyExperienceDetails = async (req, res) => {
  const { id } = req.params
    const { name, designation, feedback } = req.body;
    // Validate the form data (basic validation for non-empty fields)
    if (!name || !designation || !feedback) {
      return res.status(400).send('All fields are required.');
    }
  
    try {
      // Create a new WorkExperience object (or modify as needed)
      const newWorkExperience = new WorkExperience({
        user_id: id, // Assuming you're using user authentication
        work_experience_job_title: designation,
        work_experience_company_name: name,
        email: req.user.email, // Assuming email comes from authenticated user
        isVerify: true, // Initially, mark as unverified
      });
  
      // Save the new work experience to the database
      await newWorkExperience.save();
  
      res.send('Feedback submitted successfully! Please verify your email to complete the process.');
  
    } catch (error) {
      console.error(error);
      res.status(500).send('There was an error processing your request.');
    }
}
