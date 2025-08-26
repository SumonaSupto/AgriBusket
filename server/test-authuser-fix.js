// Quick test to verify the AuthUser model fix
const mongoose = require('mongoose');

// Test script to verify the AuthUser virtual fix
async function testAuthUserVirtuals() {
  try {
    // Connect to the database
    await mongoose.connect('mongodb://localhost:27017/sandbox_db');
    console.log('✅ Connected to database');

    // Import the AuthUser model
    const AuthUser = require('./models/AuthUser');

    // Find a user and test the virtuals
    const user = await AuthUser.findOne();
    if (user) {
      console.log('✅ Found user:', user.email);
      console.log('✅ Full name:', user.fullName);
      console.log('✅ Initials:', user.initials);
      console.log('✅ Virtual methods working correctly');
    } else {
      console.log('ℹ️  No users found in database');
    }

    // Test with a mock user with undefined fields
    const mockUser = new AuthUser({
      firstName: undefined,
      lastName: undefined,
      email: 'test@example.com',
      phone: '1234567890',
      password: 'testpass'
    });

    console.log('✅ Mock user initials (should handle undefined):', mockUser.initials);
    console.log('✅ Mock user fullName (should handle undefined):', mockUser.fullName);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAuthUserVirtuals();
}

module.exports = testAuthUserVirtuals;
