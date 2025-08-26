const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with admin filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock quantity
// @access  Private (Admin only)
router.patch('/:id/stock', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    
    if (!quantity || !operation) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and operation are required'
      });
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Operation must be add, subtract, or set'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = (product.inventory?.availableQuantity || 0) + parseInt(quantity);
        break;
      case 'subtract':
        newQuantity = Math.max(0, (product.inventory?.availableQuantity || 0) - parseInt(quantity));
        break;
      case 'set':
        newQuantity = parseInt(quantity);
        break;
    }

    // Update the product stock
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        'inventory.availableQuantity': newQuantity,
        'inventory.isInStock': newQuantity > 0,
        status: newQuantity === 0 ? 'out_of_stock' : 'active'
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Stock ${operation}ed successfully`,
      data: {
        product: updatedProduct,
        oldQuantity: product.inventory?.availableQuantity || 0,
        newQuantity: newQuantity
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
});

// @route   GET /api/products/admin/stats
// @desc    Get product statistics for admin
// @access  Private (Admin only)
router.get('/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
    const lowStockProducts = await Product.countDocuments({
      'inventory.availableQuantity': { $lte: 10 }
    });

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        lowStock: lowStockProducts,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
});

module.exports = router;
