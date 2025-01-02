const express = require('express');
const { createBlog } = require('../controllers/blogController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, createBlog);

module.exports = router; 