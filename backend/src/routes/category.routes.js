const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateJwt } = require('../middleware/auth');

// Public Routes
router.get('/', categoryController.list);
router.get('/tree', categoryController.getTree);
router.get('/select-list', categoryController.getSelectList);
router.get('/:id', categoryController.getById);
router.get('/:id/children', categoryController.getChildren);
router.get('/:id/ancestors', categoryController.getAncestors);
router.get('/:id/descendants', categoryController.getDescendants);

// Protected Routes (auth only, no role restriction)
router.use(authenticateJwt);

router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.patch('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

// Hard delete (auth only, no role restriction)
router.delete('/:id/hard', categoryController.hardRemove);

module.exports = router;
