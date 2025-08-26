const express = require('express');
const router = express.Router();
const AuthUser = require('../models/AuthUser');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users with filtering
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      role,
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const users = await AuthUser.find(query)
      .select('-password') // Exclude password
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await AuthUser.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const user = await AuthUser.findById(req.params.id)
      .select('-password')
      
      .populate('wishlist', 'name price images');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const {
      profile,
      address,
      farmerProfile,
      preferences
    } = req.body;

    const updateData = {};
    if (profile) updateData.profile = { ...profile };
    if (address) updateData.address = { ...address };
    if (farmerProfile) updateData.farmerProfile = { ...farmerProfile };
    if (preferences) updateData.preferences = { ...preferences };

    const user = await AuthUser.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user account
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const user = await AuthUser.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user account',
      error: error.message
    });
  }
});

// @route   POST /api/users/:id/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post('/:id/wishlist', async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await AuthUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(productId);
    await user.save();

    const updatedUser = await AuthUser.findById(user._id)
      .select('-password')
      .populate('wishlist', 'name price images');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist: updatedUser.wishlist }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:id/wishlist/:productId', async (req, res) => {
  try {
    const user = await AuthUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.wishlist = user.wishlist.filter(
      productId => !productId.equals(req.params.productId)
    );
    await user.save();

    const updatedUser = await AuthUser.findById(user._id)
      .select('-password')
      .populate('wishlist', 'name price images');

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist: updatedUser.wishlist }
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats/summary
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/stats/summary', async (req, res) => {
  try {
    const totalUsers = await AuthUser.countDocuments({ isActive: true });
    const totalCustomers = await AuthUser.countDocuments({ role: 'customer', isActive: true });
    const totalFarmers = await AuthUser.countDocuments({ role: 'farmer', isActive: true });
    const totalAdmins = await AuthUser.countDocuments({ role: 'admin', isActive: true });
    
    const newUsersToday = await AuthUser.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalFarmers,
        totalAdmins,
        newUsersToday
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

module.exports = router;
