const express = require('express');
const router = express.Router();

// Handle contact form submissions
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    // Here you would typically implement email sending logic
    // For now, we'll just return a success message
    res.json({ 
      message: 'Message received successfully',
      data: { name, email, message }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 