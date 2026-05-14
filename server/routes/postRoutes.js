// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// GET all posts (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a post (PROTECTED)
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      author: req.user.username, // Pulled securely from token
      userId: req.user.id
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a post (PROTECTED & AUTHOR ONLY)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check ownership
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own posts." });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a post (PROTECTED & AUTHOR ONLY)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check ownership
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own posts." });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;