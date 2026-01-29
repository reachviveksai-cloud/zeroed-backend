const express = require('express')
const workExperienceController = require('../../controller/workExperience.controller')
const authMiddleware = require('../../middleware/auth')
const {sendExperienceVerificationEmail, updateUserVerification} = require("../../controller/sendReferanceEmail");
const router = express.Router()

// delete work experience
router.post('/verify',sendExperienceVerificationEmail)
router.get("/verify-experience", updateUserVerification);
router.delete('/delete/:id', authMiddleware, workExperienceController.deleteWorkExperience)

module.exports = router
