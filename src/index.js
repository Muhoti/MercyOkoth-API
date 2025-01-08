const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const sequelize = require("./config/database");
const errorHandler = require("./middleware/errorMiddleware");
const addIsAdminColumn = require("./migrations/addIsAdminColumn");

const app = express();
const PORT = process.env.PORT || 3003;

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: true,
  })
);

// Add OPTIONS handling for preflight requests
app.options("*", cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = path.join(__dirname, "../uploads/resources");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sync database with retry mechanism
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("Connected to PostgreSQL database");

      // Drop and recreate all tables
      await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE;');
      console.log("Dropped existing tables");

      // Create tables with all columns
      await sequelize.sync({ force: true });
      console.log("Database tables recreated");

      // Create default admin user
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await sequelize.query(`
        INSERT INTO "Users" (email, password, "isAdmin", "createdAt", "updatedAt")
        VALUES (
          '${process.env.ADMIN_EMAIL}',
          '${hashedPassword}',
          true,
          NOW(),
          NOW()
        );
      `);
      console.log("Default admin user created");

      return true;
    } catch (error) {
      console.error(
        `Database connection attempt ${i + 1} failed:`,
        error.message
      );
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error("Failed to connect to database after multiple attempts");
};

// Routes
app.use("/api/auth", authRoutes); // Add /api prefix
app.use("/api/blogs", blogRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/resources", resourceRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server only after database connection is established
(async () => {
  try {
    await connectWithRetry();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
})();
