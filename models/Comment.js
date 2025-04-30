import mongoose from "mongoose";

const comment_schema = new mongoose.Schema({
  content: { type: String, required: true },
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'blogs' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
})

const Comment = mongoose.model('comments', comment_schema);

export default Comment;