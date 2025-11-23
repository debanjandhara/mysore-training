const userService = require('../services/user.service');

const register = async (req, res) => {
  try {
    const { user, token } = await userService.registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const googleCallback = (req, res) => {
  // req.user is populated by passport
  try {
    const { user, token } = userService.handleGoogleAuth(req.user);
    
    // In a real app, you might redirect to frontend with token in query param
    // res.redirect(`http://localhost:3000/login-success?token=${token}`);
    
    // For now, let's return JSON if testing with Postman/Browser directly without frontend app
    res.status(200).json({
      message: 'Google Login Successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  googleCallback,
};
