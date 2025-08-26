const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Updated pricing structure for compatibility
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'liter', 'piece', 'dozen', 'gram', 'pound', 'bunch', 'jar']
    }
  },
  
  category: {
    primary: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'honey', 'spices', 'herbs', 'eggs', 'other']
    },
    secondary: {
      type: String
    }
  },
  
  // Updated inventory structure
  inventory: {
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: [0, 'Reorder level cannot be negative']
    },
    maxOrderQuantity: {
      type: Number,
      default: 100,
      min: [1, 'Max order quantity must be at least 1']
    },
    isInStock: {
      type: Boolean,
      default: function() {
        return this.availableQuantity > 0;
      }
    }
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  },
  
  farmerInfo: {
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    experience: {
      type: String,
      default: ''
    }
  },
  
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    vitamins: [String]
  },
  
  certifications: [{
    type: String,
    enum: ['Organic', 'Non-GMO', 'Fair Trade', 'Local', 'Pesticide Free']
  }],
  
  features: [String],
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'out_of_stock'],
    default: 'active'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  tags: [String],
  
  seasonality: {
    availableMonths: [String],
    peakSeason: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `৳${this.pricing?.basePrice}/${this.pricing?.unit}`;
});

// Pre-save middleware to update inventory status
productSchema.pre('save', function(next) {
  if (this.inventory && this.inventory.availableQuantity !== undefined) {
    this.inventory.isInStock = this.inventory.availableQuantity > 0;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
