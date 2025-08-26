const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { protect, authorize, adminOnly } = require('../middleware/auth');

// @route   GET /api/testimonials
// @desc    Get all approved testimonials (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      limit = 4, 
      page = 1, 
      featured = false,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    let query = { isApproved: true, isActive: true };
    let sort = {};

    // Build sort object
    if (sortBy === 'order') {
      sort = { order: sortOrder === 'desc' ? -1 : 1, createdAt: -1 };
    } else if (sortBy === 'rating') {
      sort = { rating: sortOrder === 'desc' ? -1 : 1, createdAt: -1 };
    } else {
      sort = { createdAt: sortOrder === 'desc' ? -1 : 1 };
    }

    let testimonials;

    if (featured === 'true') {
      // Get featured testimonials (highest rated)
      testimonials = await Testimonial.getFeatured(parseInt(limit));
    } else {
      // Get paginated testimonials
      const skip = (parseInt(page) - 1) * parseInt(limit);
      testimonials = await Testimonial.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
});

// @route   GET /api/testimonials/admin
// @desc    Get all testimonials for admin (including pending approval)
// @access  Private (Admin)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Filter by approval status
    if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const testimonials = await Testimonial.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
});

// @route   POST /api/testimonials
// @desc    Create a new testimonial (public submission)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, image, text, rating, location, occupation } = req.body;

    // Validate required fields
    if (!name || !email || !image || !text || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, image, text, rating'
      });
    }

    const testimonial = new Testimonial({
      name,
      email,
      image,
      text,
      rating,
      location,
      occupation,
      isApproved: false // Requires admin approval
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully. It will be reviewed by our team.',
      data: testimonial
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message
    });
  }
});

// @route   PUT /api/testimonials/:id/approve
// @desc    Approve a testimonial
// @access  Private (Admin)
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    testimonial.isApproved = true;
    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial approved successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve testimonial',
      error: error.message
    });
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Update a testimonial
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, image, text, rating, location, occupation, order, isActive } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Update fields
    if (name !== undefined) testimonial.name = name;
    if (email !== undefined) testimonial.email = email;
    if (image !== undefined) testimonial.image = image;
    if (text !== undefined) testimonial.text = text;
    if (rating !== undefined) testimonial.rating = rating;
    if (location !== undefined) testimonial.location = location;
    if (occupation !== undefined) testimonial.occupation = occupation;
    if (order !== undefined) testimonial.order = order;
    if (isActive !== undefined) testimonial.isActive = isActive;

    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message
    });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.deleteOne();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message
    });
  }
});

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Only return approved testimonials for non-admin requests
    if (!testimonial.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial',
      error: error.message
    });
  }
});

module.exports = router;
