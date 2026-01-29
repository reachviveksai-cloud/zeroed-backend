const router = require("express").Router()
const authMiddleware = require('../../middleware/auth')
const projectController = require('../../controller/project')
const {sendProjectVerificationEmail, updateProjectVerification} = require("../../controller/sendReferanceEmail");

router.post('/verify', sendProjectVerificationEmail)
router.get("/verify-project", updateProjectVerification);
router.use('/delete/:id', authMiddleware, projectController.deleteProject)
module.exports = router