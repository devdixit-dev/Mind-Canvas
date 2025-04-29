import transporter from '../config/nodemailer.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

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

    if(user.isVerified === false) {
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