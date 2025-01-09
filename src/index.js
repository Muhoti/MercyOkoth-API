require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Test the connection and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL database");
    await sequelize.sync(); // This creates the tables if they don't exist

    // Routes with /api prefix
    app.use("/api/auth", authRoutes);
    app.use("/api/blogs", blogRoutes);
    app.use("/api/gallery", galleryRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
