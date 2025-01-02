const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create skill
router.post('/', async (req, res) => {
  try {
    const newSkill = await Skill.create(req.body);
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 