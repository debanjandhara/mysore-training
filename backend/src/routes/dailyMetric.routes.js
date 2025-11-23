const express = require('express');
const router = express.Router();
const dailyMetricController = require('../controllers/dailyMetric.controller');
const { authenticateJwt } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Public - Record view/share (e.g. from frontend pixel)
router.post('/metrics/record', dailyMetricController.record);

// Protected - Get Analytics
router.get(
  '/posts/:postId/analytics', 
  authenticateJwt, 
  requireRole(['admin', 'blogger']), 
  dailyMetricController.getStats
);

module.exports = router;
