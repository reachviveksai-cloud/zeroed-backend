const express = require('express');
const internationalEducationController = require('../../controller/internationalEducation.controller');
const router = express.Router();

router.post('/', internationalEducationController.addEducation);
router.delete('/delete/:id', internationalEducationController.deleteEducation);

module.exports = router;
