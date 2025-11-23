const dailyMetricService = require('../services/dailyMetric.service');

// Record Metric Endpoint
const record = async (req, res, next) => {
  try {
    const { postId, type, source } = req.body;
    
    // If postId not in body, check params
    const targetPostId = postId || req.params.postId;
    
    if (!targetPostId) {
      return res.status(400).json({ message: 'Post ID required' });
    }

    await dailyMetricService.recordMetric({ 
      postId: targetPostId, 
      type, 
      source 
    });
    
    res.status(200).json({ message: 'Metric recorded' });
  } catch (error) {
    next(error);
  }
};

// Get Analytics Endpoint
const getStats = async (req, res, next) => {
  try {
    const { days } = req.query;
    const { postId } = req.params;

    const metrics = await dailyMetricService.getPostMetrics(postId, parseInt(days) || 30);
    const summary = await dailyMetricService.getPostSummary(postId);

    res.json({
      summary,
      daily: metrics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  record,
  getStats
};
