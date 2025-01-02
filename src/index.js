require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3003;

// Test the connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL database');
        await sequelize.sync(); // This creates the tables if they don't exist
    } catch (error) {
        console.error('Unable to connect to the database:', error);
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