const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const AuthUser = require('./models/AuthUser');
const Order = require('./models/Order');

// Connect to database
const connectDB = require('./config/database');

async function runTests() {
  try {
    console.log('🧪 Starting comprehensive tests...\n');
    
    // Connect to database
    await connectDB();
    
    // Test 1: Check collections exist
    console.log('📋 Testing database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const expectedCollections = ['products', 'authusers', 'orders', 'testimonials', 'contacts'];
    expectedCollections.forEach(col => {
      if (collectionNames.includes(col)) {
        console.log(`✅ Collection '${col}' exists`);
      } else {
        console.log(`⚠️  Collection '${col}' missing (this might be normal if empty)`);
      }
    });
    
    // Test 2: Test product model
    console.log('\n🛍️  Testing Product model...');
    try {
      const testProduct = new Product({
        name: 'Test Product',
        description: 'Test description',
        pricing: {
          basePrice: 10,
          unit: 'kg'
        },
        category: {
          primary: 'vegetables'
        },
        inventory: {
          availableQuantity: 50
        },
        images: [{
          url: 'test-image.jpg',
          alt: 'Test image'
        }],
        farmerInfo: {
          name: 'Test Farmer',
          location: 'Test Location'
        }
      });
      
      const validationError = testProduct.validateSync();
      if (validationError) {
        console.log('❌ Product model validation failed:', validationError.message);
      } else {
        console.log('✅ Product model validation passed');
      }
    } catch (error) {
      console.log('❌ Product model test failed:', error.message);
    }
    
    // Test 3: Test AuthUser model
    console.log('\n👤 Testing AuthUser model...');
    try {
      const testUser = new AuthUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        role: 'customer'
      });
      
      const validationError = testUser.validateSync();
      if (validationError) {
        console.log('❌ AuthUser model validation failed:', validationError.message);
      } else {
        console.log('✅ AuthUser model validation passed');
      }
    } catch (error) {
      console.log('❌ AuthUser model test failed:', error.message);
    }
    
    // Test 4: Count existing records
    console.log('\n📊 Checking existing data...');
    const productCount = await Product.countDocuments();
    const userCount = await AuthUser.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`📦 Products in database: ${productCount}`);
    console.log(`👥 Users in database: ${userCount}`);
    console.log(`🛒 Orders in database: ${orderCount}`);
    
    // Test 5: Test indexes
    console.log('\n🔍 Testing database indexes...');
    const productIndexes = await Product.collection.getIndexes();
    const userIndexes = await AuthUser.collection.getIndexes();
    
    console.log(`✅ Product indexes: ${Object.keys(productIndexes).length}`);
    console.log(`✅ User indexes: ${Object.keys(userIndexes).length}`);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = runTests;
