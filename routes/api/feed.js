const express = require('express');
const router = express.Router();
const feedController = require('../../controller/feed');
const multer = require('multer');
const upload = multer(); // memory storage by default

router.post('/', upload.single('thumbnail'), feedController.createFeed);
router.get('/', feedController.getAllFeeds);
router.get('/:id', feedController.getFeedById);
router.put('/:id', upload.single('thumbnail'), feedController.updateFeed);
router.delete('/:id', feedController.deleteFeed);

module.exports = router;
