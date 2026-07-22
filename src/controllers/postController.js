const Post = require("../models/post");
const User = require("../models/User");

exports.createPost = async (req, res, next) => {
  try {
    const { title, body, imageUrl } = req.body;
    const author = req.user.userId;

    if (!title || !body) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 100) {
      return res
        .status(400)
        .json({ message: "Title must be 3-100 characters" });
    }
    if (cleanBody.length < 3 || cleanBody.length > 2000) {
      return res
        .status(400)
        .json({ message: "Body must be 3-2000 characters" });
    }

    // const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const image = req.file ? req.file.path : undefined;

    const post = await Post.create({
      title: cleanTitle,
      body: cleanBody,
      image,
      author,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id).populate("author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });
    if (!post) {
      return res.status(404).json({
        message: "post not found",
      });
    }

    post.title = req.body.title ?? post.title;
    post.body = req.body.body ?? post.body;
    post.image = req.body.imageUrl ?? post.image;

    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({
        message: "post not found",
      });
    }

    const isOwner = post.author.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You can't delete this post" });
    }

    await post.deleteOne();

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
