const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env'); // Ensure env.js exports JWT_REFRESH_SECRET too or use same
const crypto = require('crypto');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET; // Fallback

/**
 * Generate Access and Refresh Tokens
 * @param {Object} user 
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

/**
 * Register a new user
 * @param {Object} userData 
 * @returns {Object} { user, tokens }
 */
const register = async (userData) => {
  const { name, email, password, username } = userData;

  if (await userRepository.findByEmail(email)) {
    const error = new Error('Email already in use');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }
  
  if (username && await userRepository.findByUsername(username)) {
    const error = new Error('Username already in use');
    error.code = 'USERNAME_EXISTS';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name,
    email,
    username,
    password: hashedPassword,
  });

  const tokens = generateTokens(user);
  
  user.refreshToken = tokens.refreshToken;
  await userRepository.saveUser(user);

  return { user, tokens };
};

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { user, tokens }
 */
const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.code = 'AUTH_FAILED';
    throw error;
  }

  if (!user.password) {
    const error = new Error('Please login with Google');
    error.code = 'AUTH_GOOGLE_REQUIRED';
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.code = 'AUTH_FAILED';
    throw error;
  }

  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await userRepository.saveUser(user);

  return { user, tokens };
};

/**
 * Logout user
 * @param {string} userId 
 */
const logout = async (userId) => {
  const user = await userRepository.findById(userId);
  if (user) {
    user.refreshToken = null;
    await userRepository.saveUser(user);
  }
};

/**
 * Refresh access token
 * @param {string} token 
 * @returns {Object} { accessToken, refreshToken }
 */
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw new Error();
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await userRepository.saveUser(user);

    return tokens;
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.code = 'INVALID_TOKEN';
    throw error;
  }
};

/**
 * Forgot Password
 * @param {string} email 
 * @returns {string} token
 */
const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await userRepository.saveUser(user);

  // In a real app, send email here.
  // console.log(`Reset Token: ${resetToken}`);
  return resetToken; 
};

/**
 * Reset Password
 * @param {string} token 
 * @param {string} newPassword 
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await mongoose.model('User').findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    const error = new Error('Invalid or expired token');
    error.code = 'INVALID_TOKEN';
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await userRepository.saveUser(user);
};

/**
 * Handle Google Login
 * @param {Object} user 
 * @returns {Object} { user, tokens }
 */
const googleLogin = async (user) => {
  const tokens = generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  await userRepository.saveUser(user);
  return { user, tokens };
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleLogin,
};
