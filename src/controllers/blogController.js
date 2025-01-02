const Blog = require('../models/blogModel');

exports.createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        const blog = await Blog.create({
            title,
            content,
            authorId: req.user.userId
        });
        res.status(201).send(blog);
    } catch (error) {
        res.status(400).send(error.message);
    }
}; 