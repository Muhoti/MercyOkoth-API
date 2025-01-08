const express = require("express");
const {
  register,
  login,
  checkAdmin,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-admin", authenticate, checkAdmin);

module.exports = router;
