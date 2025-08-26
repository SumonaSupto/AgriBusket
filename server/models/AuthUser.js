const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[0-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['user', 'customer', 'admin', 'farm_owner'],
    default: 'user'
  },
  
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationCode: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  // Phone Verification
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationCode: {
    type: String,
    select: false
  },
  phoneVerificationExpires: {
    type: Date,
    select: false
  },
  
  // Password Reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: String,
  
  // Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLoginAt: Date,
  lastLoginIP: String,
  
  // Profile Information
  avatar: {
    url: String,
    publicId: String
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  
  // Address Information
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home'
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Bangladesh' },
    isDefault: { type: Boolean, default: false }
  }],
  
  // Shopping Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'BDT' },
    newsletter: { type: Boolean, default: true }
  },
  
  // E-commerce Related
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Analytics
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  lastOrderDate: Date,
  
  // Social Login
  googleId: String,
  facebookId: String,
  
  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser'
  },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 }
  
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationCode;
      delete ret.phoneVerificationCode;
      delete ret.passwordResetToken;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  const firstName = this.firstName || '';
  const lastName = this.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Virtual for initials
userSchema.virtual('initials').get(function() {
  const firstInitial = this.firstName ? this.firstName.charAt(0) : '';
  const lastInitial = this.lastName ? this.lastName.charAt(0) : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to generate referral code
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification code (6-digit)
userSchema.methods.generateEmailVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = code;
  this.emailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  return code;
};

// Generate phone verification code (6-digit)
userSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

// Generate referral code
userSchema.methods.generateReferralCode = function() {
  const prefix = 'AG';
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${randomString}`;
};

// Verify email verification code
userSchema.methods.verifyEmailCode = function(code) {
  return this.emailVerificationCode === code && 
         this.emailVerificationExpires > Date.now();
};

// Verify phone verification code
userSchema.methods.verifyPhoneCode = function(code) {
  return this.phoneVerificationCode === code && 
         this.phoneVerificationExpires > Date.now();
};

// Clear verification codes
userSchema.methods.clearVerificationCodes = function() {
  this.emailVerificationCode = undefined;
  this.emailVerificationExpires = undefined;
  this.emailVerificationToken = undefined;
  this.phoneVerificationCode = undefined;
  this.phoneVerificationExpires = undefined;
};

// Update login info
userSchema.methods.updateLoginInfo = function(ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIP = ip;
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Lock for 2 hours after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  }
  this.loginAttempts += 1;
  return this.save();
};

// Add item to cart
userSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }
  
  return this.save();
};

// Remove item from cart
userSchema.methods.removeFromCart = function(productId) {
  this.cart = this.cart.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

// Clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

// Add to wishlist
userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this.save();
};

// Remove from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(id => id.toString() !== productId.toString());
  return this.save();
};

// Update order statistics
userSchema.methods.updateOrderStats = function(orderValue) {
  this.totalOrders += 1;
  this.totalSpent += orderValue;
  this.averageOrderValue = this.totalSpent / this.totalOrders;
  this.lastOrderDate = new Date();
  return this.save();
};

// Static method to find by email verification token
userSchema.statics.findByEmailVerificationToken = function(token) {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
};

// Static method to find by password reset token
userSchema.statics.findByPasswordResetToken = function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
};

module.exports = mongoose.model('AuthUser', userSchema);
