const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateJwt } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Public Routes
router.get('/', categoryController.list);
router.get('/tree', categoryController.getTree);
router.get('/select-list', categoryController.getSelectList);
router.get('/:id', categoryController.getById);
router.get('/:id/children', categoryController.getChildren);
router.get('/:id/ancestors', categoryController.getAncestors);
router.get('/:id/descendants', categoryController.getDescendants);

// Management Routes (Unprotected)
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.patch('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

// Admin only (Unprotected as per request for Category routes)
router.delete('/:id/hard', categoryController.hardRemove);
router.post('/:id/migrate', categoryController.migrateToTag);

module.exports = router;
