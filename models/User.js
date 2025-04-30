import mongoose from "mongoose";

const user_schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  blogsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'blogs' }],
  isVerified: { type: Boolean, default: false },
  registerOtp: { type: String, default: null },
  verifyOtp: { type: String, default: null }
});

const User = mongoose.model('users', user_schema);

export default User;