const savedSearchRepository = require('../repositories/savedSearch.repository');

/**
 * Create a saved search
 * @param {Object} data 
 * @returns {Object} savedSearch
 */
const createSavedSearch = async (data) => {
  return savedSearchRepository.createSavedSearch(data);
};

/**
 * Get user's saved searches
 * @param {string} userId 
 * @returns {Array} savedSearches
 */
const getUserSavedSearches = async (userId) => {
  return savedSearchRepository.findByUser(userId);
};

/**
 * Delete a saved search
 * @param {string} id 
 * @param {string} userId 
 */
const deleteSavedSearch = async (id, userId) => {
  const search = await savedSearchRepository.findById(id);
  if (!search) {
    const error = new Error('Saved search not found');
    error.code = 'NOT_FOUND';
    throw error;
  }
  
  if (search.user.toString() !== userId.toString()) {
    const error = new Error('Unauthorized');
    error.code = 'FORBIDDEN';
    throw error;
  }

  await savedSearchRepository.deleteSavedSearch(id);
};

module.exports = {
  createSavedSearch,
  getUserSavedSearches,
  deleteSavedSearch,
};
