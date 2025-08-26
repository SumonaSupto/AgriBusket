const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true,
    maxlength: [500, 'Testimonial text cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters']
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order must be a positive number']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
testimonialSchema.index({ isApproved: 1, isActive: 1, order: 1 });
testimonialSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
testimonialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for short text (for cards/previews)
testimonialSchema.virtual('shortText').get(function() {
  return this.text.length > 150 ? this.text.substring(0, 150) + '...' : this.text;
});

// Static method to get approved testimonials
testimonialSchema.statics.getApproved = function() {
  return this.find({ 
    isApproved: true, 
    isActive: true 
  }).sort({ order: 1, createdAt: -1 });
};

// Static method to get featured testimonials (limit to top rated)
testimonialSchema.statics.getFeatured = function(limit = 4) {
  return this.find({ 
    isApproved: true, 
    isActive: true 
  })
  .sort({ rating: -1, order: 1, createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Testimonial', testimonialSchema);
