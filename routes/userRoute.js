import express from 'express'
import { getBlogPage, getCreateNewBlog, getDashboard, GetOtpVerification, getProfile, Login, Logout, PostAddYourComment, PostCreateNewBlog, PostOtpVerification, PostVerifyInfo, Register } from '../controllers/userControllers.js';
import UserAuth from '../middlewares/userAuth.js';

const userRouter = express.Router();

// GET
userRouter.get('/otp-verification', GetOtpVerification);

userRouter.get('/dashboard', UserAuth, getDashboard);

userRouter.get('/create-new-blog', UserAuth, getCreateNewBlog);

userRouter.get('/profile', UserAuth, getProfile);

userRouter.get('/blog/:id', UserAuth, getBlogPage);

// POST
userRouter.post('/register', Register);

userRouter.post('/otp-verification', PostOtpVerification);

userRouter.post('/login', Login);

userRouter.post('/logout', Logout);

userRouter.post('/create-new-blog', UserAuth, PostCreateNewBlog);

userRouter.post('/verify-info', UserAuth, PostVerifyInfo);

userRouter.post('/comment/:blogId', UserAuth, PostAddYourComment);


export default userRouter;