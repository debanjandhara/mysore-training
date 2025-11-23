const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticateJwt } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Public Routes (Listing)
router.get('/posts/:postId/comments', commentController.getByPost);
router.get('/comments/:id/replies', commentController.getReplies);
router.get('/comments/tree', commentController.getTree);
router.get('/comments/:id/votes', authenticateJwt, commentController.getVotes); // Auth optional but good for checking own vote

// CRUD Protected
router.use(authenticateJwt);

router.post('/comments', commentController.create);
router.get('/comments/:id', commentController.getById);
router.put('/comments/:id', commentController.update);
router.delete('/comments/:id', commentController.remove);

// Voting
router.post('/comments/:id/vote', commentController.vote);

// Moderation
router.patch('/comments/:id/status', requireRole(['admin', 'blogger']), commentController.updateStatus);

module.exports = router;
