const dailyMetricRepository = require('../repositories/dailyMetric.repository');
const postRepository = require('../repositories/post.repository');

// Helper to normalize date to start of day
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Record a new metric event (view, share, etc)
 * @param {Object} data { postId, type, source }
 * @returns {Promise<Object>}
 */
const recordMetric = async (data) => {
  const { postId, type, source } = data;
  
  // Validate Post exists (optional but good for integrity)
  // const post = await postRepository.findPostById(postId);
  // if (!post) throw new Error('Post not found');

  const today = getStartOfDay();
  
  // Valid types allowed by schema
  const validTypes = ['views', 'socialShares', 'uniqueVisitors'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid metric type');
  }

  return dailyMetricRepository.incrementMetric(postId, today, type, source);
};

/**
 * Get metrics for a post over a period
 * @param {string} postId 
 * @param {number} days Number of days to look back
 * @returns {Promise<Array>}
 */
const getPostMetrics = async (postId, days = 30) => {
  const endDate = getStartOfDay();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  return dailyMetricRepository.findByPostAndDateRange(postId, startDate, endDate);
};

/**
 * Get overall summary for a post
 * @param {string} postId 
 * @returns {Promise<Object>}
 */
const getPostSummary = async (postId) => {
  const result = await dailyMetricRepository.aggregateTotal(postId);
  return result[0] || { totalViews: 0, totalShares: 0, totalUnique: 0 };
};

module.exports = {
  recordMetric,
  getPostMetrics,
  getPostSummary
};
