require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3003;

// Test database connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL database");
    
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
})();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);
app.use('/gallery', galleryRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 