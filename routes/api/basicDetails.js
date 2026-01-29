const express = require('express');
const basicDetailsController = require('../../controller/basicInformation.controller');
const router = express.Router();
const isAdmin = require('../../middleware/isAdmin')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/basic-details',upload.single('profile_pic'), basicDetailsController.addProfile);
router.put('/basic-details/:id',upload.single('profile_pic'), basicDetailsController.updateProfile);
router.delete('/basic-details/:id', basicDetailsController.deleteProfile);
router.get('/basic-details',isAdmin,basicDetailsController.listProfiles);

module.exports = router;
