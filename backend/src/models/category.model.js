const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  parentCategoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Indexes
categorySchema.index({ parentCategoryId: 1 });
categorySchema.index({ deletedAt: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
