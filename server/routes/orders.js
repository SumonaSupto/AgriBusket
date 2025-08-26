const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuthUser = require('../models/AuthUser');
const Farm = require('../models/Farm');
const { protect, adminOnly } = require('../middleware/auth');

// ===== SPECIFIC ROUTES FIRST (BEFORE PARAMETERIZED ROUTES) =====

// @route   GET /api/orders/my-user-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-user-orders', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query for user's orders
    const query = { 
      userId: userId,
      isActive: true 
    };
    
    if (status) query.orderStatus = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('items.productId', 'name images price')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate order stats for the user
    const stats = await Order.aggregate([
      { $match: { userId: userId, isActive: true } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    const orderStats = {
      total: total,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      processing: stats.find(s => s._id === 'processing')?.count || 0,
      shipped: stats.find(s => s._id === 'shipped')?.count || 0,
      delivered: stats.find(s => s._id === 'delivered')?.count || 0,
      cancelled: stats.find(s => s._id === 'cancelled')?.count || 0,
      totalSpent: stats.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
    };

    res.json({
      success: true,
      data: {
        orders,
        stats: orderStats,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics
// @access  Private (Admin)
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    
    // Get additional stats
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const todayOrders = await Order.countDocuments({
      orderDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    res.json({
      success: true,
      data: {
        ordersByStatus: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
});

// ===== GENERAL ROUTES (NON-PARAMETERIZED) =====

// @route   GET /api/orders
// @desc    Get all orders with filtering and pagination
// @access  Private (Admin)
router.get('/', async (req, res) => {
  try {
    const {
      status,
      farmerId,
      userId,
      page = 1,
      limit = 10,
      sortBy = 'orderDate',
      sortOrder = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (status) query.orderStatus = status;
    if (farmerId) query['items.farmerId'] = farmerId;
    if (userId) query.userId = userId;
    
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      query['pricing.total'] = {};
      if (minAmount) query['pricing.total'].$gte = Number(minAmount);
      if (maxAmount) query['pricing.total'].$lte = Number(maxAmount);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('userId', 'profile.firstName profile.lastName profile.phone')
      .populate('items.productId', 'name images category')
      .populate('items.farmerId', 'profile.firstName profile.lastName farmerProfile.farmName')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      items,
      shippingAddress,
      paymentMethod = 'cash_on_delivery',
      customerNote = ''
    } = req.body;

    // Get user info
    const user = await AuthUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate and process items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId)
        .populate('farmerId', 'profile.firstName profile.lastName');
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.stock.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.images[0]?.url || '',
        quantity: item.quantity,
        unit: product.unit,
        unitPrice: product.price,
        totalPrice: itemTotal,
        farmerId: product.farmerId._id,
        farmerName: `${product.farmerId.profile.firstName} ${product.farmerId.profile.lastName}`
      });

      // Update product stock
      product.stock.quantity -= item.quantity;
      await product.save();
    }

    // Calculate pricing
    const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery over ৳500
    const tax = 0; // No tax for now
    const discount = 0; // No discount for now
    const total = subtotal + deliveryFee + tax - discount;

    // Create order
    const order = new Order({
      userId,
      customerInfo: {
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        email: user.email,
        phone: user.profile.phone
      },
      items: processedItems,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        discount,
        total
      },
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      },
      notes: {
        customerNote
      },
      statusHistory: [{
        status: 'pending',
        timestamp: new Date()
      }]
    });

    await order.save();

    // Add order to user's order history
    user.orderHistory.push(order._id);
    await user.save();

    // Populate the created order
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'profile.firstName profile.lastName profile.phone')
      .populate('items.productId', 'name images')
      .populate('items.farmerId', 'profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// ===== PARAMETERIZED ROUTES (MUST BE LAST) =====

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'profile.firstName profile.lastName profile.phone profile.avatar')
      .populate('items.productId', 'name images category')
      .populate('items.farmerId', 'profile.firstName profile.lastName farmerProfile.farmName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        orderStatus: status,
        $push: {
          statusHistory: {
            status,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        orderStatus: 'cancelled',
        isActive: false 
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { 'stock.quantity': item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// ===== ADMIN ORDER MANAGEMENT ROUTES =====

// @route   GET /api/orders/admin/all
// @desc    Get all orders for admin
// @access  Private (Admin only)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {

    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    const query = {};
    if (status) query.orderStatus = status;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('userId', 'username email profile')
      .populate('items.productId', 'name images pricing')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/admin/:orderId/status
// @desc    Update order status (Admin only)
// @access  Private (Admin only)
router.put('/admin/:orderId/status', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { orderId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.orderStatus = status;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // Add status history
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      notes: adminNotes
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics for admin
// @access  Private (Admin only)
router.get('/admin/stats', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Order counts by status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Orders this month
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Revenue statistics
    const revenueStats = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['delivered', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['delivered', 'confirmed'] },
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusCounts,
        ordersThisMonth,
        revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 },
        monthlyTrend: monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Admin order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
});

module.exports = router;
