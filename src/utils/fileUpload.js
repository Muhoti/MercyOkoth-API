const path = require("path");
const fs = require("fs").promises;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
const ebooksDir = path.join(uploadsDir, "ebooks");

// Ensure directories exist
const initializeDirectories = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(ebooksDir, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
  }
};

initializeDirectories();

exports.uploadFile = async (file, type) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(ebooksDir, fileName);

    await file.mv(filePath);

    // Return relative path to be stored in database
    return `/uploads/ebooks/${fileName}`;
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload file");
  }
};

exports.deleteFile = async (filePath) => {
  try {
    if (!filePath) return;

    // Convert URL path to filesystem path
    const fullPath = path.join(__dirname, "../..", filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("File deletion error:", error);
  }
};
