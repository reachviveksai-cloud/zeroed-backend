var express = require('express');
var router = express.Router();

const authRoutes = require("./auth");
const basicDetailsRoutes = require("./basicDetails");
const internationalEducationRoutes = require("./internationalEducation");
const canadianEducationRoutes = require("./canadianEducation");
const skillRoutes = require("./skills");
const careerGoalRoutes = require("./careerGoal");
const allInfoRoutes = require("./allInformation");
const accomplishmentRoutes = require("./accomplishment");
const workExperience = require("./workExperience");
const projects = require('./project')
const industriesRoutes = require('./industriesData')
const userRouter = require('./userRoutes')
const authMiddleware = require('../../middleware/auth')
const chatRouter = require('./chatRoutes')
const messagesRouter = require('./messagesRoutes')
const feedRouter = require('./feed')

router.use('/api/auth', authRoutes)
router.use('/api/user', basicDetailsRoutes)
router.use('/api/international-education', internationalEducationRoutes)
router.use('/api/canadian-education', canadianEducationRoutes)
router.use('/api/user', skillRoutes)
router.use('/api/user', careerGoalRoutes)
router.use('/api/user', allInfoRoutes)
router.use('/api/user', accomplishmentRoutes)
router.use('/api/work-experience', workExperience)
router.use('/api/project', projects)
router.use('/api/industry' ,industriesRoutes)
router.use('/api/chat',authMiddleware, chatRouter)
router.use('/api/message', messagesRouter)
router.use('/api/feed', authMiddleware,feedRouter)
router.use('/api', userRouter)

module.exports = router;