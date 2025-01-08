const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    console.log("Registration request received:", {
      email: req.body.email,
      // Don't log the password
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password, // Password will be hashed by the model hook
      isAdmin: false, // Default to non-admin
    });

    console.log("User registered successfully:", {
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: "Registration successful",
      userId: user.id,
    });
  } catch (error) {
    console.error("Registration error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    // Handle unique constraint violations
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    res.status(500).json({
      message: "Registration failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid email or password");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.checkAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
