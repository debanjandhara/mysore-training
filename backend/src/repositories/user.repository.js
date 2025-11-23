const User = require('../models/user.model');

const findById = (id) => {
  return User.findById(id);
};

const findByEmail = (email) => {
  return User.findOne({ email });
};

const findByGoogleId = (googleId) => {
  return User.findOne({ googleId });
};

const findByUsername = (username) => {
  return User.findOne({ username });
};

const createUser = (userData) => {
  return User.create(userData);
};

const updateUser = (id, updateData) => {
  return User.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteUser = (id) => {
  return User.findByIdAndDelete(id);
};

const saveUser = (user) => {
  return user.save();
};

module.exports = {
  findById,
  findByEmail,
  findByUsername,
  findByGoogleId,
  createUser,
  updateUser,
  deleteUser,
  saveUser,
};
