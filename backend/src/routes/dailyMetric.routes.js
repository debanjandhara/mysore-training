const express = require('express');
const router = express.Router();
const dailyMetricController = require('../controllers/dailyMetric.controller');
const { authenticateJwt } = require('../middleware/auth');

// Public - Record view/share (e.g. from frontend pixel)
router.post('/metrics/record', dailyMetricController.record);

// Protected - Get Analytics (auth only, no role restriction)
router.get(
  '/posts/:postId/analytics', 
  authenticateJwt,
  dailyMetricController.getStats
);

module.exports = router;
