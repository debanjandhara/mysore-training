const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const uploadMiddleware = require('../middleware/upload.middleware');
const { authenticateJwt } = require('../middleware/auth'); // Adjusted path and name

// Route: POST /api/upload
// Uses 'file' as the form field name
router.post('/', authenticateJwt, uploadMiddleware.single('file'), uploadController.uploadFile);

module.exports = router;
