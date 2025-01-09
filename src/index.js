require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/database");
const resourceRoutes = require("./routes/resourceRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Test the connection and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL database");

    // Force sync all models - this will drop and recreate all tables
    await sequelize.sync();
    console.log("Database tables dropped and recreated");

    // Routes with /api prefix
    app.use("/api/auth", authRoutes);
    app.use("/api", resourceRoutes);

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
