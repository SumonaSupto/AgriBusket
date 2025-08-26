const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AuthUser = require('../models/AuthUser');
const emailService = require('../services/emailService');
const { protect, requireEmailVerification, getClientIP } = require('../middleware/auth');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

// @route   POST /api/auth/register
// @desc    Register new user with email verification
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role = 'user'
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await AuthUser.findOne({ 
        $or: [{ email }, { phone }] 
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please check if MongoDB is running.'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }

    // Create new user
    const user = new AuthUser({
      firstName,
      lastName,
      email,
      phone,
      password,
      role
    });

    // Generate email verification code
    const verificationCode = user.generateEmailVerificationCode();
    
    // Save user to database
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationCode, firstName);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification code.',
        data: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          isEmailVerified: user.isEmailVerified,
          verificationRequired: true
        }
      });
    } catch (emailError) {
      // If email fails, still return success but note the email issue
      console.error('Email sending failed:', emailError);
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please note that verification email could not be sent. Please request a new verification code.',
        data: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          isEmailVerified: user.isEmailVerified,
          verificationRequired: true,
          emailError: true
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    // More detailed error handling
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please ensure MongoDB is running.',
        error: 'Database connection error'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with code sent to user's email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Find user by email
    const user = await AuthUser.findOne({ email }).select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Verify the code
    if (!user.verifyEmailCode(verificationCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.clearVerificationCodes();
    await user.save();

    // Generate token for immediate login
    const token = generateToken(user._id);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to AgriBasket!',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification code
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await AuthUser.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = user.generateEmailVerificationCode();
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationCode, user.firstName);

    res.json({
      success: true,
      message: 'Verification code sent successfully. Please check your email.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = getClientIP(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await AuthUser.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: `Account has been blocked. Reason: ${user.blockReason || 'Policy violation'}`
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Successful login - update login info
    await user.updateLoginInfo(clientIP);

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await AuthUser.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
      
      res.json({
        success: true,
        message: 'Password reset email sent successfully. Please check your email.'
      });
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by password reset token
    const user = await AuthUser.findByPasswordResetToken(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // Handle special admin case
    if (req.user._id === 'admin') {
      return res.json({
        success: true,
        data: req.user
      });
    }

    const user = await AuthUser.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    // Handle special admin case
    if (req.user._id === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin profile cannot be updated through this endpoint'
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'addresses', 'preferences'];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await AuthUser.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    // Handle special admin case
    if (req.user._id === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin password cannot be changed through this endpoint'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await AuthUser.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Legacy routes for backward compatibility
// @route   POST /api/auth/admin-login
// @desc    Admin login (hardcoded for now)
// @access  Public
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded admin credentials (in production, store in database)
    if (username === 'admin' && password === 'admin123') {
      // Check if admin user exists in database, create if not
      let adminUser = await AuthUser.findOne({ username: 'admin' });
      
      if (!adminUser) {
        adminUser = new AuthUser({
          username: 'admin',
          email: 'admin@agribasket.com',
          password: 'admin123',
          role: 'admin',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            phone: '01700000000'
          },
          isEmailVerified: true
        });
        await adminUser.save();
      }

      // Generate token
      const token = generateToken(adminUser._id);

      // Remove password from response
      const userResponse = adminUser.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: userResponse,
          token,
          isAdmin: true
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message
    });
  }
});

module.exports = router;
