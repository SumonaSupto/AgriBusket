const mongoose = require('mongoose');
require('dotenv').config();
const AuthUser = require('./models/AuthUser');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing test user if any
    await AuthUser.deleteOne({ email: 'test@example.com' });
    console.log('Deleted existing test user');

    // Create test user
    const testUser = new AuthUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'user',
      isActive: true,
      isEmailVerified: true
    });

    await testUser.save();
    console.log('Test user created successfully:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('ID:', testUser._id);

    // Test password comparison
    const isPasswordCorrect = await testUser.comparePassword('password123');
    console.log('Password comparison test:', isPasswordCorrect);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser();
