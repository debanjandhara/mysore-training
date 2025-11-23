const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Assuming req.user is populated by middleware, but logout endpoint might be public if just clearing client side?
    // However, prompt implies backend logout (invalidating refresh token).
    // Need to ensure we have user id. If this is a protected route, req.user exists.
    // If public, we need email/token in body?
    // Usually Logout is protected.
    if (req.user) {
      await authService.logout(req.user._id);
    }
    res.json({ message: 'Logged out successfully', code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = await authService.refreshToken(token);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await authService.forgotPassword(email);
    // In prod, don't return token.
    res.json({ message: 'Password reset email sent', resetToken: token, code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successfully', code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { user, tokens } = await authService.googleLogin(req.user);
    // Redirect to frontend with tokens (adjust frontend URL as needed)
    // For now returning JSON as per prompt style, but usually this is a redirect
    // res.redirect(`http://localhost:3000/auth/success?token=${tokens.accessToken}`);
    
    // Since this is an API, let's return JSON. 
    // Note: Browser visiting /auth/google/callback directly will see JSON.
    res.json({ user, tokens });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleCallback,
};
