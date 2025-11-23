const SavedSearch = require('../models/savedSearch.model');

const createSavedSearch = (searchData) => {
  return SavedSearch.create(searchData);
};

const findByUser = (userId) => {
  return SavedSearch.find({ user: userId });
};

const deleteSavedSearch = (id) => {
  return SavedSearch.findByIdAndDelete(id);
};

const findById = (id) => {
  return SavedSearch.findById(id);
};

module.exports = {
  createSavedSearch,
  findByUser,
  deleteSavedSearch,
  findById,
};
