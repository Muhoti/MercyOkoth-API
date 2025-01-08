const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const router = express.Router();

// Public route to get all resources
router.get("/", getAllResources);

// Admin-only routes
router.post("/", authenticate, isAdmin, createResource);
router.put("/:id", authenticate, isAdmin, updateResource);
router.delete("/:id", authenticate, isAdmin, deleteResource);

module.exports = router;
