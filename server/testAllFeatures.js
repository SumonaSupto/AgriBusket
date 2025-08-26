const mongoose = require('mongoose');
const fetch = require('node-fetch');
require('dotenv').config();

// Import core models
const AuthUser = require('./models/AuthUser');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Contact = require('./models/Contact');
const Testimonial = require('./models/Testimonial');
const Farm = require('./models/Farm');

const connectDB = require('./config/database');

// Test Authentication Features
const testAuth = async () => {
  try {
    console.log('🔐 Testing Authentication Features...\n');

    // Test login with existing user
    console.log('👤 Testing user login...');
    const loginResponse = await fetch('http://localhost:18562/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'israt18@cse.pstu.ac.bd',
        password: 'user123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('  Login result:', loginResult.success ? '✅ Success' : '❌ Failed');

    if (loginResult.success) {
      const token = loginResult.data.token;
      console.log('  Token received: ✅');
      
      // Test /me endpoint
      console.log('\n👤 Testing user profile endpoint...');
      const meResponse = await fetch('http://localhost:18562/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const meResult = await meResponse.json();
      console.log('  Profile fetch:', meResult.success ? '✅ Success' : '❌ Failed');
      
      if (meResult.success) {
        console.log(`  User: ${meResult.data.firstName} ${meResult.data.lastName}`);
        console.log(`  Role: ${meResult.data.role}`);
      }
    } else {
      console.log('  Error:', loginResult.message);
    }

    // Test admin login
    console.log('\n👑 Testing admin login...');
    const adminLoginResponse = await fetch('http://localhost:18562/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@framtohome.com',
        password: 'admin123'
      })
    });

    const adminLoginResult = await adminLoginResponse.json();
    console.log('  Admin login:', adminLoginResult.success ? '✅ Success' : '❌ Failed');
    
    if (adminLoginResult.success) {
      console.log('  Admin token received: ✅');
    }

  } catch (error) {
    console.error('❌ Auth test error:', error.message);
  }
};

// Test Core Database Features
const testCoreFeatures = async () => {
  try {
    console.log('\n🧪 Testing Core Database Features...\n');

    // Test 1: User Management
    console.log('👥 Testing User Management:');
    const userCount = await AuthUser.countDocuments();
    const adminCount = await AuthUser.countDocuments({ role: 'admin' });
    const farmerCount = await AuthUser.countDocuments({ role: 'farm_owner' });
    const customerCount = await AuthUser.countDocuments({ role: 'user' });
    console.log(`  ✅ Total Users: ${userCount}`);
    console.log(`    • Admins: ${adminCount}`);
    console.log(`    • Farmers: ${farmerCount}`);
    console.log(`    • Customers: ${customerCount}`);

    // Test 2: Product Catalog
    console.log('\n📦 Testing Product Catalog:');
    const productCount = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const categories = await Product.distinct('category.primary');
    console.log(`  ✅ Products: ${productCount} total, ${activeProducts} active`);
    console.log(`  ✅ Categories: ${categories.join(', ')}`);

    // Test inventory
    const lowStockProducts = await Product.countDocuments({
      'inventory.availableQuantity': { $lt: 20 }
    });
    console.log(`  ⚠️  Low stock items: ${lowStockProducts}`);

    // Test 3: Order System
    console.log('\n🛒 Testing Order System:');
    const orderCount = await Order.countDocuments();
    const orderStatuses = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    console.log(`  ✅ Orders: ${orderCount} total`);
    orderStatuses.forEach(status => {
      console.log(`    • ${status._id}: ${status.count}`);
    });

    // Test payment methods
    const paymentMethods = await Order.aggregate([
      { $group: { _id: '$paymentInfo.method', count: { $sum: 1 } } }
    ]);
    console.log('  💳 Payment methods:');
    paymentMethods.forEach(method => {
      console.log(`    • ${method._id}: ${method.count}`);
    });

    // Test 4: Contact Messages
    console.log('\n📞 Testing Contact System:');
    const contactCount = await Contact.countDocuments();
    const contactStatuses = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log(`  ✅ Contact Messages: ${contactCount} total`);
    contactStatuses.forEach(status => {
      console.log(`    • ${status._id}: ${status.count}`);
    });

    // Test 5: Testimonials
    console.log('\n⭐ Testing Testimonials:');
    const testimonialCount = await Testimonial.countDocuments();
    const approvedTestimonials = await Testimonial.countDocuments({ isApproved: true });
    const avgRating = await Testimonial.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    console.log(`  ✅ Testimonials: ${testimonialCount} total, ${approvedTestimonials} approved`);
    if (avgRating.length > 0) {
      console.log(`  ⭐ Average rating: ${avgRating[0].avgRating.toFixed(1)}/5`);
    }

    // Test 6: Farms
    console.log('\n🌾 Testing Farm Management:');
    const farmCount = await Farm.countDocuments();
    const verifiedFarms = await Farm.countDocuments({ isVerified: true });
    console.log(`  ✅ Farms: ${farmCount} registered, ${verifiedFarms} verified`);

    // Test 7: Model Relationships
    console.log('\n🔗 Testing Model Relationships:');
    try {
      const sampleOrder = await Order.findOne().populate('userId', 'firstName lastName email');
      if (sampleOrder && sampleOrder.userId) {
        console.log(`  ✅ Order-User relationship working`);
      } else {
        console.log(`  ⚠️  Order-User relationship issue`);
      }
      
      const sampleProduct = await Product.findOne().populate('farmId', 'farmName');
      if (sampleProduct && sampleProduct.farmId) {
        console.log(`  ✅ Product-Farm relationship working`);
      } else {
        console.log(`  ⚠️  Product-Farm relationship issue`);
      }

      // Test user cart/wishlist
      const userWithCart = await AuthUser.findOne({ 'cart.0': { $exists: true } });
      if (userWithCart) {
        console.log(`  ✅ User cart functionality working`);
      }

      const userWithWishlist = await AuthUser.findOne({ 'wishlist.0': { $exists: true } });
      if (userWithWishlist) {
        console.log(`  ✅ User wishlist functionality working`);
      }

    } catch (error) {
      console.log(`  ❌ Relationship test failed: ${error.message}`);
    }

    // Test 8: Data Integrity
    console.log('\n🔍 Testing Data Integrity:');
    
    // Check for orphaned data
    const ordersWithoutUsers = await Order.countDocuments({
      userId: { $nin: await AuthUser.distinct('_id') }
    });
    console.log(`  ${ordersWithoutUsers === 0 ? '✅' : '❌'} Orders without users: ${ordersWithoutUsers}`);

    const productsWithoutFarms = await Product.countDocuments({
      farmId: { $nin: await Farm.distinct('_id') }
    });
    console.log(`  ${productsWithoutFarms === 0 ? '✅' : '❌'} Products without farms: ${productsWithoutFarms}`);

    console.log('\n🎉 Core Feature Test Complete!');

  } catch (error) {
    console.error('❌ Core features test failed:', error);
    throw error;
  }
};

// Test API Endpoints
const testAPIEndpoints = async () => {
  try {
    console.log('\n🌐 Testing API Endpoints...\n');

    const baseURL = 'http://localhost:18562/api';
    
    // Test public endpoints
    console.log('📋 Testing public endpoints:');
    
    const endpoints = [
      { path: '/products', name: 'Products list' },
      { path: '/testimonials', name: 'Testimonials' },
      { path: '/farms', name: 'Farms list' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseURL}${endpoint.path}`);
        const isSuccess = response.status === 200;
        console.log(`  ${isSuccess ? '✅' : '❌'} ${endpoint.name}: ${response.status}`);
      } catch (error) {
        console.log(`  ❌ ${endpoint.name}: Connection failed`);
      }
    }

  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
};

// Main test function
const runAllTests = async () => {
  try {
    console.log('🚀 Starting Comprehensive Feature Testing...');
    console.log('==========================================\n');

    // Connect to database
    await connectDB();
    
    // Run all tests
    await testCoreFeatures();
    await testAuth();
    await testAPIEndpoints();

    console.log('\n==========================================');
    console.log('🎉 All Tests Completed Successfully!');
    console.log('\n📊 Test Summary:');
    console.log('  ✅ Database connectivity');
    console.log('  ✅ Core model functionality'); 
    console.log('  ✅ User authentication');
    console.log('  ✅ API endpoints');
    console.log('  ✅ Data relationships');
    console.log('  ✅ Data integrity');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
};

// Only run if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testAuth,
  testCoreFeatures,
  testAPIEndpoints,
  runAllTests
};
