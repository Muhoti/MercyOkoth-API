require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const authRoutes = require('./src/routes/authRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Database connection
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'postgres'
    }
);

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