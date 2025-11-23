const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateJwt } = require('../middleware/auth');

// Public Routes
router.get('/', postController.list);
router.get('/search', postController.search);
router.get('/slug/:slug', postController.getBySlug);
router.get('/:id', postController.getById);
router.post('/:id/stat/view', postController.viewStat);

// Protected Routes (auth only, no role restriction)
router.use(authenticateJwt);

// CRUD
router.post('/', postController.create);
router.put('/:id', postController.update);
router.patch('/:id', postController.update);
router.delete('/:id', postController.remove);

// Publishing
router.post('/:id/publish', postController.publish);
router.post('/:id/unpublish', postController.unpublish);
router.post('/:id/schedule', postController.schedule);
router.get('/scheduled/all', postController.getScheduled); // "all" to differentiate from :id

// Multimedia
router.post('/:id/multimedia', postController.addMultimedia);
router.delete('/:id/multimedia/:mid', postController.removeMultimedia);

// Taxonomy
router.post('/:id/tags', postController.updateTags); // Simplified to POST update
router.put('/:id/categories', postController.updateCategories);

// SEO
router.post('/:id/seo', postController.updateSeo);
router.get('/:id/preview', postController.getSeoPreview);

module.exports = router;
