const Resource = require("../models/Resource");
const { uploadFile, deleteFile } = require("../utils/fileUpload");
const path = require("path");

exports.createResource = async (req, res) => {
  try {
    const { type } = req.body;
    let resourceData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Handle PDF upload for ebooks
    if (type === "ebooks" && req.files && req.files.pdf) {
      const file = req.files.pdf;

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          message: "File size too large. Maximum size is 2MB",
        });
      }

      // Check file type
      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({
          message: "Only PDF files are allowed",
        });
      }

      const fileUrl = await uploadFile(file, "ebooks");
      resourceData.fileUrl = fileUrl;
    }

    const resource = await Resource.create(resourceData);
    res.status(201).json(resource);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({ message: "Failed to create resource" });
  }
};

exports.getResources = async (req, res) => {
  try {
    const { type } = req.query;
    const resources = await Resource.findAll({
      where: type ? { type } : {},
      order: [["createdAt", "DESC"]],
    });
    res.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle PDF update for ebooks
    if (req.files && req.files.pdf) {
      // Delete old file if exists
      if (resource.fileUrl) {
        await deleteFile(resource.fileUrl);
      }

      const file = req.files.pdf;
      const fileUrl = await uploadFile(file, "ebooks");
      req.body.fileUrl = fileUrl;
    }

    await resource.update(req.body);
    res.json(resource);
  } catch (error) {
    console.error("Update resource error:", error);
    res.status(500).json({ message: "Failed to update resource" });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete PDF file if exists
    if (resource.fileUrl) {
      await deleteFile(resource.fileUrl);
    }

    await resource.destroy();
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ message: "Failed to delete resource" });
  }
};
