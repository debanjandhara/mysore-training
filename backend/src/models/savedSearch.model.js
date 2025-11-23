const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed, // To store JSON filters
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);

module.exports = SavedSearch;
