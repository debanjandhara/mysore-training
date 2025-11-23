const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJwt } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateJwt);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

router.get('/me/saved-searches', userController.getSavedSearches);
router.post('/me/saved-searches', userController.createSavedSearch);
router.delete('/me/saved-searches/:id', userController.deleteSavedSearch);

router.get('/:username', userController.getUserByUsername);

module.exports = router;
