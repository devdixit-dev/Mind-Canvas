import transporter from '../config/nodemailer.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const Register = async (req, res) => {

  const { username, email, password } = req.body;

  try{
    if(!username || !email || !password){
      return res.status(404).json({
        success: false,
        message: 'all fields are required'
      });
    }

    const user = await User.findOne({ email });

    if(user) {
      return res.status(404).json({
        success: false,
        message: `account already exist`
      })
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

    const newUser = await User.create({ username, email, password: hashPassword, registerOtp: GenOtp});

    res.cookie('token', encodeURI(newUser._id), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30min
    })

    return res.status(201).redirect('/user/otp-verification');

  }
  catch(e) {
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

  if(!token) {
    return res.json({
      success: false,
      message: `You need to register first`
    })
  }

  try{
    if(!otp) {
      return res.json({
        success: false,
        message: `otp is required for verification`
      })
    }

    const user = await User.findOne({ _id: token });
    console.log(user)


    if(user.registerOtp === otp){
      user.isVerified = true;
      user.registerOtp = null;
      user.save();
      return res.redirect('/login');
    }
    else{
      return res.json({
        success: false,
        message: `Authentication failed. Try again.`
      })
    }
  }
  catch(e) {
    return res.json({
      success: false,
      message: `Internal server error - ${e}`
    })
  }

}
