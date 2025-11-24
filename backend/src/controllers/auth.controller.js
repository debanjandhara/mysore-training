const authService = require('../services/auth.service');

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'Lax', // Changed from Strict to Lax for better redirect compatibility
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  res.cookie('refreshToken', token, cookieOptions);
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    setTokenCookie(res, result.tokens.refreshToken);
    // Don't send refreshToken in body
    res.status(201).json({ 
      user: result.user, 
      token: result.tokens.accessToken,
      message: "Registration successful"
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setTokenCookie(res, result.tokens.refreshToken);
    res.json({ 
      user: result.user, 
      token: result.tokens.accessToken,
      message: "Login successful"
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await authService.logout(req.user._id);
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });
    res.json({ message: 'Logged out successfully', code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const result = await authService.refreshToken(token);
    
    // Rotate refresh token
    setTokenCookie(res, result.refreshToken);
    
    res.json({ 
      accessToken: result.accessToken,
      success: true 
    });
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
    
    setTokenCookie(res, tokens.refreshToken);
    
    // Redirect to frontend with success flag, NO tokens
    res.redirect(`http://localhost:5173/auth?loginSuccess=true`);
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
