const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env'); // Ensure env.js exports JWT_REFRESH_SECRET too or use same
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET; // Fallback

// Basic mail transporter using env credentials
const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

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
 * @returns {string} token (for dev/testing)
 */
const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // Generate raw token and store a hashed version on the user
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await userRepository.saveUser(user);

  // Build reset URL for frontend
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

  // Simple HTML email with both code and link
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #333333;">
      
      <!-- Main Card Container -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden;">
        
        <!-- Header with Brand Color -->
        <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">Blogify - Reset Link</h1>
        </div>

        <!-- Content Area -->
        <div style="padding: 40px 40px 20px 40px;">
          <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5;">Hi ${user.name || 'there'},</p>
          
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #4b5563;">
            We received a request to reset the password for your account. To proceed, please click the button below:
          </p>

          <!-- Primary Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
              Reset your password
            </a>
          </div>

          <!-- Divider / Copy Paste Option -->
          <div style="border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;"></div>

          <p style="margin: 0 0 10px; font-size: 13px; color: #6b7280;">
            If the button doesn't work, you can copy and paste the following link directly into your browser:
          </p>

          <!-- Raw Link Container -->
          <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; word-break: break-all;">
            <a href="${resetUrl}" style="color: #4f46e5; text-decoration: none; font-size: 12px; line-height: 1.4;">${resetUrl}</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            This link will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
        
      </div>
    </div>
`;


  if (process.env.NODEMAILER_EMAIL && process.env.NODEMAILER_PASSWORD) {
    await mailTransporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: 'Reset your Blogify password',
      html,
    });
  }

  // For dev/testing, return the raw token so it can be used directly.
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
