const DailyMetric = require('../models/dailyMetric.model');

/**
 * Increment metric for a specific post and date
 * Upserts if document doesn't exist for that day
 * @param {string} postId 
 * @param {Date} date (start of day)
 * @param {string} type 'views', 'socialShares', 'uniqueVisitors'
 * @param {string} source Traffic source (optional)
 * @returns {Promise<Object>}
 */
const incrementMetric = (postId, date, type, source) => {
  const update = {
    $inc: { [type]: 1 }
  };

  // Increment specific traffic source if provided
  if (source) {
    update.$inc[`trafficSources.${source}`] = 1;
  }

  return DailyMetric.findOneAndUpdate(
    { postId, date },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

/**
 * Find metrics for a post within a date range
 * @param {string} postId 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Promise<Array>}
 */
const findByPostAndDateRange = (postId, startDate, endDate) => {
  return DailyMetric.find({
    postId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

/**
 * Aggregate total metrics for a post
 * @param {string} postId 
 * @returns {Promise<Object>}
 */
const aggregateTotal = (postId) => {
  return DailyMetric.aggregate([
    { $match: { postId: new mongoose.Types.ObjectId(postId) } },
    {
      $group: {
        _id: '$postId',
        totalViews: { $sum: '$views' },
        totalShares: { $sum: '$socialShares' },
        totalUnique: { $sum: '$uniqueVisitors' }
      }
    }
  ]);
};

module.exports = {
  incrementMetric,
  findByPostAndDateRange,
  aggregateTotal
};
