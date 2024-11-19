require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog';
mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Blog Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now },
  tags: [String],
});

const Post = mongoose.model('Post', postSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Blog API!');
});

// Fetch all blog posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
});

// Fetch a single post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post', error: err.message });
  }
});

// Create a new blog post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    const newPost = new Post({ title, content, author, tags });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: 'Error creating post', error: err.message });
  }
});

// Update a blog post by ID
app.put('/api/posts/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: 'Error updating post', error: err.message });
  }
});

// Delete a blog post by ID
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({ message: 'Post deleted successfully', post: deletedPost });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
});

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
