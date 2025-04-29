import express from 'express'
import { getCreateNewBlog, getDashboard, GetOtpVerification, getProfile, Login, Logout, PostCreateNewBlog, PostOtpVerification, PostVerifyInfo, Register } from '../controllers/userControllers.js';
import UserAuth from '../middlewares/userAuth.js';

const userRouter = express.Router();

// GET
userRouter.get('/otp-verification', GetOtpVerification);

userRouter.get('/dashboard', UserAuth, getDashboard);

userRouter.get('/create-new-blog', UserAuth, getCreateNewBlog);

userRouter.get('/profile', UserAuth, getProfile);

// POST
userRouter.post('/register', Register);

userRouter.post('/otp-verification', PostOtpVerification);

userRouter.post('/login', Login);

userRouter.post('/logout', Logout);

userRouter.post('/create-new-blog', UserAuth, PostCreateNewBlog);

userRouter.post('/verify-info', UserAuth, PostVerifyInfo);


export default userRouter;