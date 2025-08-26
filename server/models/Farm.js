const mongoose = require('mongoose');

// Farm Schema - Represents farm businesses that supply products
const farmSchema = new mongoose.Schema({
  // Basic Farm Information
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farm owner is required']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  establishedYear: {
    type: Number,
    min: [1900, 'Invalid establishment year'],
    max: [new Date().getFullYear(), 'Future year not allowed']
  },
  
  // Contact Information
  contactInfo: {
    primaryPhone: {
      type: String,
      required: [true, 'Primary phone is required']
    },
    secondaryPhone: String,
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    website: String
  },
  
  // Location Information
  location: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'Bangladesh' }
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    farmSize: {
      value: { type: Number },
      unit: { type: String, enum: ['acres', 'hectares', 'square_feet'], default: 'acres' }
    }
  },
  
  // Farm Specialization
  specialization: {
    primaryCrops: [{
      type: String,
      enum: ['vegetables', 'fruits', 'grains', 'herbs', 'dairy', 'poultry', 'fish', 'livestock', 'organic', 'other']
    }],
    farmingMethods: [{
      type: String,
      enum: ['organic', 'conventional', 'hydroponic', 'sustainable', 'permaculture']
    }],
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateNumber: String
    }]
  },
  
  // Business Information
  businessInfo: {
    licenseNumber: String,
    taxId: String,
    bankDetails: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountHolderName: String
    }
  },
  
  // Farm Status & Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Statistics & Ratings
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 }
  },
  
  // Operating Information
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    openTime: String,
    closeTime: String,
    isClosed: { type: Boolean, default: false }
  }],
  
  // Delivery Information
  deliveryInfo: {
    deliveryRadius: { type: Number, default: 50 }, // in kilometers
    deliveryMethods: [{
      type: String,
      enum: ['farm_pickup', 'local_delivery', 'shipping', 'farmers_market']
    }],
    deliveryFee: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
farmSchema.index({ farmName: 'text', description: 'text' });
farmSchema.index({ ownerUserId: 1 });
farmSchema.index({ verificationStatus: 1 });
farmSchema.index({ isActive: 1 });
farmSchema.index({ 'location.address.city': 1 });
farmSchema.index({ 'location.address.state': 1 });
farmSchema.index({ 'specialization.primaryCrops': 1 });
farmSchema.index({ 'stats.averageRating': -1 });
farmSchema.index({ isFeatured: -1, 'stats.averageRating': -1 });

module.exports = mongoose.model('Farm', farmSchema);
