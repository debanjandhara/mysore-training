const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required if googleId is not present
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values (for non-google users)
    },
    profileImage: {
      type: String,
    },
    // New Profile Fields
    bio: {
      type: String,
      maxLength: 500,
      default: '',
    },
    location: {
      type: String,
      maxLength: 100,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    role: {
      type: String,
      enum: ['user', 'blogger', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
