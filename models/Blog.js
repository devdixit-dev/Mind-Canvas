import mongoose from "mongoose";

const blog_schema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
  image: { type: String, default: 'https://placehold.co/300x200' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('blogs', blog_schema)

export default Blog