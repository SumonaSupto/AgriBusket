const express = require('express');
const router = express.Router();
const AuthUser = require('../models/AuthUser');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const Testimonial = require('../models/Testimonial');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Test route to verify admin routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get current date ranges for comparisons
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User statistics
    const totalUsers = await AuthUser.countDocuments();
    const newUsersThisMonth = await AuthUser.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const newUsersLastMonth = await AuthUser.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const ordersLastMonth = await Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const lowStockProducts = await Product.countDocuments({
      'inventory.quantity': { $lte: 10 }
    });

    // Revenue statistics
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const currentRevenue = revenueData[0]?.totalRevenue || 0;
    const previousRevenue = lastMonthRevenue[0]?.totalRevenue || 0;

    // Contact statistics
    const unreadContacts = await Contact.countDocuments({ isRead: false });
    const newContacts = await Contact.countDocuments({ status: 'new' });

    // Calculate growth percentages
    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
      : 0;
    
    const orderGrowth = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
      : 0;
    
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          thisMonth: newUsersThisMonth,
          growth: userGrowth
        },
        orders: {
          total: totalOrders,
          thisMonth: ordersThisMonth,
          growth: orderGrowth
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts
        },
        revenue: {
          current: currentRevenue,
          growth: revenueGrowth
        },
        contacts: {
          unread: unreadContacts,
          new: newContacts
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Get recent orders
router.get('/dashboard/recent-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentOrders = await Order.find()
      .populate('userId', 'username email profile.firstName profile.lastName')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderId customerInfo pricing totalAmount status orderStatus createdAt items');

    const formattedOrders = recentOrders.map(order => ({
      id: order.orderId,
      customer: order.customerInfo?.name || 
                `${order.userId?.profile?.firstName || ''} ${order.userId?.profile?.lastName || ''}`.trim() ||
                order.userId?.username || 'Unknown',
      email: order.customerInfo?.email || order.userId?.email,
      products: order.items.map(item => item.productId?.name || item.productName).join(', ') || 'No products',
      amount: `৳${order.pricing?.total || order.totalAmount || 0}`,
      status: order.orderStatus || order.status || 'pending',
      date: order.createdAt
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message
    });
  }
});

// Get sales analytics
router.get('/dashboard/sales-analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics',
      error: error.message
    });
  }
});

// Get top selling products
router.get('/dashboard/top-products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSold: 1,
          totalRevenue: 1,
          currentStock: '$product.inventory.quantity'
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products',
      error: error.message
    });
  }
});

module.exports = router;
