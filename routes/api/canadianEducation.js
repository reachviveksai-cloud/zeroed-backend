const express = require('express');
const canadianEducationController = require('../../controller/canadianEducation.controller');
const router = express.Router();

router.post('/', canadianEducationController.addCanadianDetails);
router.delete('/delete/:id', canadianEducationController.deleteCanadianEducation);

module.exports = router;
