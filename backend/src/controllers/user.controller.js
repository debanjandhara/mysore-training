const userService = require('../services/user.service');
const savedSearchService = require('../services/savedSearch.service');

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    await userService.deleteUser(req.user._id);
    res.json({ message: 'User deleted', code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

const getUserByUsername = async (req, res, next) => {
  try {
    const user = await userService.getUserByUsername(req.params.username);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Saved Searches
const getSavedSearches = async (req, res, next) => {
  try {
    const searches = await savedSearchService.getUserSavedSearches(req.user._id);
    res.json(searches);
  } catch (error) {
    next(error);
  }
};

const createSavedSearch = async (req, res, next) => {
  try {
    const search = await savedSearchService.createSavedSearch({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(search);
  } catch (error) {
    next(error);
  }
};

const deleteSavedSearch = async (req, res, next) => {
  try {
    await savedSearchService.deleteSavedSearch(req.params.id, req.user._id);
    res.json({ message: 'Saved search deleted', code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getUserByUsername,
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
};
