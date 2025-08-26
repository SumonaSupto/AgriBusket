const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit a contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, phone, company, category } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, message'
      });
    }

    // Get client IP and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      phone,
      company,
      category: category || 'general',
      ipAddress,
      userAgent
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        submittedAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    
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
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'all',
      category = 'all',
      priority = 'all',
      isRead = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by category
    if (category !== 'all') {
      query.category = category;
    }

    // Filter by priority
    if (priority !== 'all') {
      query.priority = priority;
    }

    // Filter by read status
    if (isRead !== 'all') {
      query.isRead = isRead === 'true';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contacts = await Contact.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    // Get statistics
    const stats = {
      total: await Contact.countDocuments({}),
      unread: await Contact.countDocuments({ isRead: false }),
      new: await Contact.countDocuments({ status: 'new' }),
      inProgress: await Contact.countDocuments({ status: 'in-progress' }),
      resolved: await Contact.countDocuments({ status: 'resolved' })
    };

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private (Admin)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read when viewed
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status/notes
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, priority, adminNotes, isRead } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Update fields
    if (status !== undefined) contact.status = status;
    if (priority !== undefined) contact.priority = priority;
    if (adminNotes !== undefined) contact.adminNotes = adminNotes;
    if (isRead !== undefined) contact.isRead = isRead;

    // Set response date if status is changed to resolved
    if (status === 'resolved' && !contact.responseDate) {
      contact.responseDate = new Date();
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    
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
      message: 'Failed to update contact message',
      error: error.message
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await contact.deleteOne();

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
});

// @route   GET /api/contact/stats/dashboard
// @desc    Get contact statistics for dashboard
// @access  Private (Admin)
router.get('/stats/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = {
      total: await Contact.countDocuments({}),
      unread: await Contact.countDocuments({ isRead: false }),
      today: await Contact.countDocuments({ createdAt: { $gte: startOfDay } }),
      thisWeek: await Contact.countDocuments({ createdAt: { $gte: startOfWeek } }),
      thisMonth: await Contact.countDocuments({ createdAt: { $gte: startOfMonth } }),
      byStatus: {
        new: await Contact.countDocuments({ status: 'new' }),
        inProgress: await Contact.countDocuments({ status: 'in-progress' }),
        resolved: await Contact.countDocuments({ status: 'resolved' }),
        closed: await Contact.countDocuments({ status: 'closed' })
      },
      byCategory: {
        general: await Contact.countDocuments({ category: 'general' }),
        support: await Contact.countDocuments({ category: 'support' }),
        sales: await Contact.countDocuments({ category: 'sales' }),
        complaint: await Contact.countDocuments({ category: 'complaint' }),
        suggestion: await Contact.countDocuments({ category: 'suggestion' }),
        partnership: await Contact.countDocuments({ category: 'partnership' })
      },
      byPriority: {
        low: await Contact.countDocuments({ priority: 'low' }),
        medium: await Contact.countDocuments({ priority: 'medium' }),
        high: await Contact.countDocuments({ priority: 'high' }),
        urgent: await Contact.countDocuments({ priority: 'urgent' })
      }
    };

    // Get recent messages
    const recentMessages = await Contact.getRecent(5);

    res.json({
      success: true,
      data: {
        stats,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
      error: error.message
    });
  }
});

module.exports = router;
