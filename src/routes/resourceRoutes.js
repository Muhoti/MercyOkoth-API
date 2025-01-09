const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Apply authentication to all routes except file serving
router.use(/^(?!\/uploads).*/, authenticate);

// Serve uploaded files
router.get("/uploads/:filename", resourceController.getFile);

// Resource routes
router.get("/:type", resourceController.getResources);

// Create routes with type parameter
router.post("/blogs", (req, res) => {
  req.params.type = "blogs";
  resourceController.createResource(req, res);
});

router.post("/events", (req, res) => {
  req.params.type = "events";
  resourceController.createResource(req, res);
});

router.post("/ebooks", upload.single("pdfFile"), (req, res) => {
  req.params.type = "ebooks";
  resourceController.createResource(req, res);
});

router.put("/:type/:id", resourceController.updateResource);
router.delete("/:type/:id", resourceController.deleteResource);

module.exports = router;
