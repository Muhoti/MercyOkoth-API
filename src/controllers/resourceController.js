const Blog = require("../models/blogModel");
const Event = require("../models/eventModel");
const Ebook = require("../models/ebookModel");
const path = require("path");
const fs = require("fs-extra");

// Helper function to get model based on resource type
const getModel = (type) => {
  console.log("Getting model for type:", type);
  switch (type) {
    case "blogs":
      return Blog;
    case "events":
      return Event;
    case "ebooks":
      return Ebook;
    default:
      throw new Error(`Invalid resource type: ${type}`);
  }
};

// Get all resources of a specific type
exports.getResources = async (req, res) => {
  console.log("GET request received for type:", req.params.type);
  try {
    const Model = getModel(req.params.type);
    console.log("Fetching resources for user:", req.user.userId);

    const resources = await Model.findAll({
      order: [["createdAt", "DESC"]],
      where: { authorId: req.user.userId },
    });

    console.log(`Found ${resources.length} resources`);
    res.status(200).json(resources);
  } catch (error) {
    console.error("Error fetching resources:", {
      type: req.params.type,
      userId: req.user.userId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
    res.status(500).json({
      message: `Failed to fetch ${req.params.type}`,
      error: error.message,
    });
  }
};

// Create a new resource
exports.createResource = async (req, res) => {
  console.log("\n=== Create Resource Request ===");
  console.log("Request type:", req.params.type);
  console.log("Request user:", req.user);
  console.log("Request body:", req.body);
  if (req.file) console.log("Uploaded file:", req.file);

  try {
    const Model = getModel(req.params.type);

    // Validate required fields based on resource type
    let requiredFields = ["title", "description"];
    let resourceData = {
      ...req.body,
      authorId: req.user.userId,
    };

    switch (req.params.type) {
      case "blogs":
        requiredFields.push("content");
        break;
      case "events":
        requiredFields.push("date", "time", "location", "registrationLink");
        break;
      case "ebooks":
        if (!req.file) {
          return res.status(400).json({
            message: "PDF file is required for ebooks",
          });
        }
        // Save the file path relative to uploads directory
        resourceData.fileUrl = req.file.filename;
        break;
    }

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      // If file was uploaded but other fields are missing, delete the file
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    console.log("Creating resource with data:", resourceData);
    const resource = await Model.create(resourceData);
    console.log("Resource created:", resource.toJSON());

    // For ebooks, add the full URL to the response
    if (req.params.type === "ebooks") {
      resource.dataValues.fileUrl = `http://localhost:3003/uploads/${resource.fileUrl}`;
    }

    res.status(201).json(resource);
  } catch (error) {
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    console.error("Create resource error:", {
      type: error.name,
      message: error.message,
      stack: error.stack,
      details: error.errors,
    });

    res.status(400).json({
      message: `Failed to create ${req.params.type}`,
      error: error.message,
      details: error.errors,
    });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  console.log("\n=== Update Resource Request ===");
  console.log("Request params:", { type: req.params.type, id: req.params.id });
  console.log("Request user:", req.user);
  console.log("Update data:", req.body);
  if (req.file) console.log("New file:", req.file);

  try {
    const Model = getModel(req.params.type);
    const resource = await Model.findByPk(req.params.id);

    if (!resource) {
      console.log("Resource not found:", req.params.id);
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.authorId !== req.user.userId) {
      console.log("Authorization failed:", {
        resourceAuthor: resource.authorId,
        requestUser: req.user.userId,
      });
      return res
        .status(403)
        .json({ message: "Not authorized to update this resource" });
    }

    // Handle file replacement for ebooks
    if (req.params.type === "ebooks" && req.file) {
      // Delete the old file if it exists
      if (resource.fileUrl) {
        const oldFilePath = path.join(
          __dirname,
          "../../uploads",
          resource.fileUrl
        );
        await fs
          .remove(oldFilePath)
          .catch((err) => console.error("Error deleting old file:", err));
      }
      // Update with new file
      req.body.fileUrl = req.file.filename;
    }

    const updatedResource = await resource.update(req.body);

    // Add full URL for ebook files
    if (req.params.type === "ebooks") {
      updatedResource.dataValues.fileUrl = `http://localhost:3003/uploads/${updatedResource.fileUrl}`;
    }

    console.log("Resource updated successfully:", {
      id: updatedResource.id,
      type: req.params.type,
    });

    res.status(200).json(updatedResource);
  } catch (error) {
    // If there was an error and a new file was uploaded, delete it
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    console.error("Error updating resource:", {
      type: req.params.type,
      id: req.params.id,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
    res.status(400).json({
      message: `Failed to update ${req.params.type}`,
      error: error.message,
    });
  }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
  console.log("\n=== Delete Resource Request ===");
  console.log("Request params:", { type: req.params.type, id: req.params.id });
  console.log("Request user:", req.user);

  try {
    const Model = getModel(req.params.type);
    const resource = await Model.findByPk(req.params.id);

    if (!resource) {
      console.log("Resource not found:", req.params.id);
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.authorId !== req.user.userId) {
      console.log("Authorization failed:", {
        resourceAuthor: resource.authorId,
        requestUser: req.user.userId,
      });
      return res
        .status(403)
        .json({ message: "Not authorized to delete this resource" });
    }

    await resource.destroy();
    console.log("Resource deleted successfully:", req.params.id);

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", {
      type: req.params.type,
      id: req.params.id,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
    res.status(500).json({
      message: `Failed to delete ${req.params.type}`,
      error: error.message,
    });
  }
};

// Add a new method to serve files
exports.getFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../../uploads", req.params.filename);
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ message: "Error serving file" });
  }
};
