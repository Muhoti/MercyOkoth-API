const express = require('express');
const { uploadPhoto } = require('../controllers/galleryController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', authenticate, uploadPhoto);

module.exports = router; 