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

// Protected Routes
router.use(authenticateJwt);
router.use(requireRole(['admin', 'blogger'])); 

router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.patch('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

// Admin only
router.delete('/:id/hard', requireRole(['admin']), categoryController.hardRemove);

module.exports = router;
