const Resource = require("../models/resourceModel");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resources/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

exports.createResource = [
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, type, content } = req.body;

      const resourceData = {
        title,
        description,
        type,
        content,
        fileUrl: req.files.file ? req.files.file[0].path : null,
        thumbnail: req.files.thumbnail ? req.files.thumbnail[0].path : null,
      };

      const resource = await Resource.create(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
];

exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.findAll();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateResource = [
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, type, content } = req.body;

      const resourceData = {
        title,
        description,
        type,
        content,
      };

      if (req.files.file) {
        resourceData.fileUrl = req.files.file[0].path;
      }
      if (req.files.thumbnail) {
        resourceData.thumbnail = req.files.thumbnail[0].path;
      }

      const resource = await Resource.findByPk(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      await resource.update(resourceData);
      res.json(resource);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
];

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await resource.destroy();
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
