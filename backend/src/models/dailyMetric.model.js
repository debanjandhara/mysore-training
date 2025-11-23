const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Daily Metric Schema
 * Uses the Bucket Pattern to aggregate analytics per post per day.
 */
const dailyMetricSchema = new Schema({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  // We group analytics by day to prevent creating a document per-view
  date: { 
    type: Date, 
    required: true 
  }, 
  // Counters (update via $inc)
  views: { type: Number, default: 0 },
  socialShares: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  
  // US-7: Traffic sources stored as a Map for flexibility
  // e.g., { "google": 50, "twitter": 20, "newsletter": 5 }
  trafficSources: {
    type: Map,
    of: Number,
    default: {}
  }
});

// Compound index to ensure one document per post per day
dailyMetricSchema.index({ postId: 1, date: 1 }, { unique: true });

const DailyMetric = mongoose.model('DailyMetric', dailyMetricSchema);

module.exports = DailyMetric;
