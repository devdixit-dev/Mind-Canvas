import express from 'express'
import { GetOtpVerification, PostOtpVerification, Register } from '../controllers/userControllers.js';

const userRouter = express.Router();

// GET
userRouter.get('/otp-verification', GetOtpVerification)

// POST
userRouter.post('/register', Register);

userRouter.post('/otp-verification', PostOtpVerification);

export default userRouter;