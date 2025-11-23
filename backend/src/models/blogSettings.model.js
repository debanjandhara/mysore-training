const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSettingsSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  themeConfig: {
    themeId: { type: String, default: 'default-light' },
    primaryColor: { 
      type: String, 
      default: '#3b82f6',
      validate: {
        validator: function(v) {
          return /^#([0-9a-fA-F]{3}){1,2}$/.test(v);
        },
        message: props => `${props.value} is not a valid hex color!`
      }
    },
    fontFamily: { type: String, default: 'Roboto' },
    customCss: { type: String },
    logoUrl: { type: String }
  },
  savedDesignPresets: [{
    name: String,
    config: Object 
  }],
  socialIntegrations: [{
    platform: { type: String, enum: ['twitter', 'facebook', 'linkedin'] },
    accessToken: { type: String, select: false },
    autoShare: { type: Boolean, default: false }
  }],
  seoDefaults: {
    defaultMetaTitle: String,
    defaultMetaDescription: String
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Index for soft deletes and lookups
blogSettingsSchema.index({ userId: 1, deletedAt: 1 });

const BlogSettings = mongoose.model('BlogSettings', blogSettingsSchema);

module.exports = BlogSettings;
