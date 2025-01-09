const Blog = require("../models/blogModel");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, description } = req.body;

    if (!title || !content || !description) {
      return res.status(400).json({
        message: "Title, content, and description are required",
      });
    }

    const blog = await Blog.create({
      title,
      content,
      description,
      authorId: req.user.userId,
    });

    res.status(201).json({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      description: blog.description,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(400).json({
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "title",
        "content",
        "description",
        "createdAt",
        "updatedAt",
      ],
    });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, content, description } = req.body;
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this blog" });
    }

    await blog.update({
      title,
      content,
      description,
    });

    res.status(200).json({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      description: blog.description,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(400).json({ message: "Failed to update blog" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.authorId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this blog" });
    }

    await blog.destroy();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Failed to delete blog" });
  }
};
