import transporter from '../config/nodemailer.js';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js'
import bcrypt from 'bcryptjs';

import mongoose from 'mongoose'



export const Register = async (req, res) => {

  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      const message = 'All fields are required for registration !'
      return res.render('register', { message });
    }

    const user = await User.findOne({ email });

    if (user) {
      const message = 'Account already exist !'
      return res.render('register', { message });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // generate Random OTP
    const GenOtp = Math.floor(Math.random() * 99999 + 1);

    // sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to Mind Canvas',
      text: `Welcome to mind canvas website. Your account has been created with email id: ${email}. Your verification OTP is ${GenOtp}`
    }

    await transporter.sendMail(mailOptions);

    const newUser = await User.create({ username, email, password: hashPassword, registerOtp: GenOtp });

    res.cookie('token', encodeURI(newUser._id), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30min
    })

    return res.redirect('/user/otp-verification');

  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    });
  }

}

export const GetOtpVerification = async (req, res) => {
  res.render('otp-verification')
}

export const PostOtpVerification = async (req, res) => {

  const token = req.cookies.token;
  const { otp } = req.body;

  if (!token) {
    const message = 'You need to register first to verify your account !'
    return res.render('otp-verification', { message });
  }

  try {
    if (!otp) {
      const message = 'OTP is required for verification !'
      return res.render('otp-verification', { message });
    }

    const user = await User.findOne({ _id: token });

    if (user.registerOtp === otp) {
      user.isVerified = true;
      user.registerOtp = null;
      user.save();
      return res.redirect('/login');
    }
    else {
      user.registerOtp = null;
      user.save();
      const message = 'OTP verification failed. Try again !'
      token = null
      return res.render('otp-verification', { message });
    }
  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    })
  }

}

export const Login = async (req, res) => {

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      const message = 'both fields are required to login'
      return res.render('login', { message })
    }

    const user = await User.findOne({ email });

    if (!user) {
      const message = 'User not found, You need to register first'
      return res.render('login', { message })
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      const message = 'Incorrect email or password'
      return res.render('login', { message })
    }

    if (user.isVerified === false) {
      return res.redirect('/register');
    }

    res.cookie('token', encodeURI(user._id), {
      secure: true,
      sameSite: 'strict',
      httpOnly: true,
      maxAge: 30 * 60 * 1000 // 30min
    })

    res.redirect('/user/dashboard');

  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    })
  }

}

export const Logout = async (req, res) => {

  res.clearCookie('token');
  res.redirect('/login')

}

export const getDashboard = async (req, res) => {
  const user = req.user;
  const blogs = await Blog.find();
  res.render('dashboard', { user, blogs });
}

export const getCreateNewBlog = async (req, res) => {
  const user = req.user
  res.render('create-new-blog', { user });
}

export const PostCreateNewBlog = async (req, res) => {
  const user = req.user
  const { title, description, content } = req.body;

  try {
    if (!title || !description || !content) {
      return res.render('create-new-blog');
    }

    const blog = await Blog.create({
      author: user._id,
      title,
      description,
      content,
    });

    blog.save();
    user.blogsPosted.push(blog._id)
    user.save();

    return res.redirect('/user/dashboard')
  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    })
  }

}

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('blogsPosted');
  res.render('profile', { user });
}

export const PostVerifyInfo = async (req, res) => {
  const user = req.user;
  const { username, email, oldPassword, newPassword } = req.body;

  const matchPassword = await bcrypt.compare(oldPassword, user.password);

  if (!matchPassword) {
    return res.redirect('/user/profile');
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  // sending verification email
  const verifyMail = {
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: 'Updating your information',
    text: `Hello, ${user.email}. You just changed your email to ${email}.`
  }

  await transporter.sendMail(verifyMail);

  user.username = username,
    user.email = email,
    user.password = hashPassword,
    user.save();

  res.redirect('/user/profile');
}

export const getBlogPage = async (req, res) => {
  try {
    const blogId = req.params.id;
    const comments = await Comment.find({blogId: blogId}).populate('createdBy')

    if(!blogId) {
      return res.json({
        success: false,
        message: 'blog not found. check again...'
      })
    }

    const blog = await Blog.findById(blogId).populate('author');
    const user = await User.findById(blog.author);
    const username = user.username

    res.render('view-blog', {username, blog, comments});
  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    });
  }
}

export const PostAddYourComment = async (req, res) => {
  try{

    const comment = await Comment.create({
      content: req.body.comment,
      blogId: req.params.blogId,
      createdBy: req.user._id
    })

    return res.redirect(`/user/blog/${req.params.blogId}`)

  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    });
  }
}

export const PostDeleteYourBlog = async (req, res) => {
  const user = req.user;
  const id = req.params.blogId; // 68137f5c9c6a85eaf28d4df7
  
  const blog = await Blog.deleteOne({ _id: id });

  if(!id){
    return res.redirect('/user/profile');
  }

  if(!blog){
    return res.redirect('/user/profile')
  }

  // delete id from blogPosted array
  user.blogsPosted = user.blogsPosted.filter(
    postedId => !postedId.equals(id)
  );
  
  user.save();

  return res.redirect('/user/profile');

}

export const PostFindUserByEmail = async (req, res) => {

  try{

    const { email } = req.body;

    const user = await User.findOne({ email });

    if(!user) {
      return res.redirect('/register');
    }

    // generate Random OTP
    const GenOtp = Math.floor(Math.random() * 99999 + 1);

    // sending verification email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Forgot Password - User Verification',
      text: `Your account has been created with email id: ${email}. Your password reset OTP is ${GenOtp}`
    }

    await transporter.sendMail(mailOptions);

    user.verifyOtp = GenOtp;
    user.save();

    res.cookie('token', encodeURI(user._id), {
      secure: true,
      sameSite: 'strict',
      httpOnly: true,
      maxAge: 10 * 60 * 1000 // 10min
    });
    res.render('verify-otp');

  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    });
  }

}

export const PostVerifyOTP = async (req, res) => {

  try{
    const id = req.cookies.token;
    const { otp } = req.body;

    if(!otp){
      return res.json({
        success: false,
        message: 'otp is required for verification'
      })
    }

    const user = await User.findById(id);

    if(!user){
      return res.redirect('/register');
    }

    if(!user.verifyOtp === otp){
      return res.redirect('/user/find-user');
    }

    user.verifyOtp = null;

    return res.redirect('/change-password');
    
  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    });
  }

}

export const PostChangeUserPassword = async (req, res) => {

  try{

    const id = req.cookies.token;
    const { newPassword } = req.body;

    const user = await User.findById(id);

    const decodePassword = await bcrypt.hash(newPassword, 10);

    user.password = decodePassword
    user.save();

    res.redirect('/login')

  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    });
  }

}