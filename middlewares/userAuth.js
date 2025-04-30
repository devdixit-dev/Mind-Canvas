import User from "../models/User.js"

const UserAuth = async (req, res, next) => {
  const token = req.cookies.token

  try {
    if (!token) {
      return res.redirect('/login')
    }

    const user = await User.findById(token);

    if (!user) {
      return res.redirect('/login')
    }

    req.user = user
    next();
  }
  catch (e) {
    return res.json({
      success: false,
      message: `Internal server error ${e}`
    })
  }

}

export default UserAuth;