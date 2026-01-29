const express = require('express');
const careerGoalController = require('../../controller/careerGoal.controller');
const router = express.Router();

router.post('/career-goals', careerGoalController.addCareerGoal);

module.exports = router;
