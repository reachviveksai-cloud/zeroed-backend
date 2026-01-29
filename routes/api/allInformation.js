const express = require('express')
const allDetailsController = require('../../controller/allDetails.controller')
const upload = require('../../middleware/upload')
const authMiddleware = require('../../middleware/auth')
const router = express.Router()
const status = require('../../constants/apiStatusCode');
const { check, validationResult, param } = require('express-validator');
const multer = require('multer');
const fs = require('fs');

const storageFinal = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/';
    if (file.fieldname === 'profile_pic') {
      dest += 'profile_pics/';
    } else if (file.fieldname === 'video') {
      dest += 'videos/';
    } else if (file.fieldname === 'secondary_video') {
      dest += 'videos/';
    } else if (file.fieldname.startsWith('certificate_core_')) {
      dest += 'certificates/';
    }

    // Ensure the directory exists
    fs.mkdirSync(dest, { recursive: true });

    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Use a unique filename
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadFinal = multer({
  storage: storageFinal,
    limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error);
    }
    cb(null, true);
  },
});
// Update profile information
router.put(
    '/update-profile/:id',
    async (req, res, next) => {
        await uploadFinal.any()(req, res, err => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(500).json({ message: 'File upload error', error: err });
            }
            next();
        });
    },
    allDetailsController.updateInformation,
);
router.post(
  '/all-details',
  authMiddleware,
  async (req, res, next) => {
   await uploadFinal.any()(req, res, err => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(500).json({ message: 'File upload error', error: err });
      }
      next();
    });
  },

  // This is your controller where you can process the request further
  allDetailsController.createInformation
);

router.put(
    '/update-secondary-video/:userId',
    authMiddleware,
    async (req, res, next) => {
        await uploadFinal.single('secondary_video')(req, res, err => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(500).json({ message: 'File upload error', error: err });
            }
            next();
        });
    },
    allDetailsController.updateSecondaryVideo
);


// Get profile information without auth
router.get('/get-details/:userId', allDetailsController.getInformation)

// Get profile information with auth
router.get('/get-data/:userId', allDetailsController.getInformation)



module.exports = router
