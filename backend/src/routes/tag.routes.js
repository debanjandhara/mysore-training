const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const { authenticateJwt } = require('../middleware/auth');

// Public Routes
router.get('/', tagController.list);
router.get('/top', tagController.getTop);
router.get('/suggest', tagController.suggest);
router.get('/select-list', tagController.getSelectList);
router.get('/:id', tagController.getById);

// Protected Routes (auth only, no role restriction)
router.use(authenticateJwt);

router.post('/', tagController.create);
router.put('/:id', tagController.update);
router.patch('/:id', tagController.update);
router.delete('/:id', tagController.remove);

module.exports = router;
