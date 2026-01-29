const multer = require('multer');
const path = require('path');

// Set up the storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
    // cb(null, Date.now() + '-' + file.originalname);  // Renaming the file to avoid collisions
  },
});

// Set up Multer upload instance with file filters (accepts pdf, image, video)
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /png|jpeg|jpg|mp4|webm|ogg|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  },
});