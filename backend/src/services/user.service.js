const userRepository = require('../repositories/user.repository');

/**
 * Get user profile by ID
 * @param {string} id 
 * @returns {Object} user
 */
const getUserProfile = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
};

/**
 * Update user profile
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Object} user
 */
const updateUserProfile = async (id, updateData) => {
  const user = await userRepository.updateUser(id, updateData);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
};

/**
 * Delete user
 * @param {string} id 
 */
const deleteUser = async (id) => {
  const user = await userRepository.deleteUser(id);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
};

/**
 * Get user by username
 * @param {string} username 
 * @returns {Object} user
 */
const getUserByUsername = async (username) => {
  const user = await userRepository.findByUsername(username);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserByUsername,
};
