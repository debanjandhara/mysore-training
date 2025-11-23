const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexes
tagSchema.index({ deletedAt: 1 });
tagSchema.index({ name: 'text' }); // For search/suggest

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
