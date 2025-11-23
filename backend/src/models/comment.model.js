const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Comment Schema
 * Defines structure for comments, including threading, status, moderation flags, and voting.
 */
const commentSchema = new Schema({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true,
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment', 
    default: null,
    index: true
  },
  content: { type: String, required: true, maxlength: 1000 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'deleted'], 
    default: 'approved' 
  },
  reportFlags: [{
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    createdAt: { type: Date, default: Date.now }
  }],
  votes: {
    score: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  editedAt: { type: Date },
  editedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Compound index for fetching comments of a post, often sorted by date
commentSchema.index({ postId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
