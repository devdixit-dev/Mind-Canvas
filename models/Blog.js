import mongoose from "mongoose";

const blog_schema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, required: true },
  image: { type: String, default: 'https://placehold.co/300x200' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('blogs', blog_schema)

export default Blog