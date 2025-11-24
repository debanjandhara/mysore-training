const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Post Schema
 * Defines the structure for blog posts including content, media, seo and stats.
 */
const postSchema = new Schema({
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String, required: true },
  headerImage: { type: String, required: true },
  multimedia: [{
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    caption: String
  }],
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'published', 'archived'], 
    default: 'draft' 
  },
  categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  tagIds: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  publishedAt: { type: Date },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  cachedStats: {
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    aggregateRating: { type: Number, default: 0 }
  },
  deletedAt: { type: Date, default: null } // Soft delete support
}, { timestamps: true });

// Indexes for common queries
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ authorId: 1 });
postSchema.index({ 'seo.keywords': 1 });
postSchema.index({ title: 'text', content: 'text' }); // For search

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
