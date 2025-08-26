const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      const timestamp = Date.now();
      const random1 = Math.floor(Math.random() * 100000);
      const random2 = Math.floor(Math.random() * 100000);
      return `ORD-${timestamp}-${random1}-${random2}`;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser',
    required: [true, 'User ID is required']
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productImage: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      default: null
    },
    farmerName: String
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    division: {
      type: String,
      required: true
    },
    postalCode: String,
    country: {
      type: String,
      default: 'Bangladesh'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cash_on_delivery', 'sslcommerz', 'bkash', 'nagad', 'rocket', 'card', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    // SSLCommerz specific fields
    sslcommerz: {
      sessionkey: String,
      GatewayPageURL: String,
      val_id: String,
      bank_tran_id: String,
      card_type: String,
      card_no: String,
      card_issuer: String,
      card_brand: String,
      card_sub_brand: String,
      card_issuer_country: String,
      currency_type: String,
      currency_amount: Number,
      store_amount: Number,
      verify_sign: String,
      verify_key: String,
      risk_level: String,
      risk_title: String
    }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser'
    }
  }],
  deliveryInfo: {
    estimatedDelivery: Date,
    actualDelivery: Date,
    trackingNumber: String,
    courier: String,
    instructions: String
  },
  notes: {
    customerNote: String,
    adminNote: String,
    farmerNote: String
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted order ID
orderSchema.virtual('formattedOrderId').get(function() {
  return this.orderId;
});

// Virtual for order summary
orderSchema.virtual('summary').get(function() {
  return {
    totalItems: this.items.length,
    totalQuantity: this.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: this.pricing.total
  };
});

// Pre-save middleware to add status to history
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date()
    });
  }
  next();
});

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.total' }
      }
    }
  ]);
  return stats;
};

module.exports = mongoose.model('Order', orderSchema);
