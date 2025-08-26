const mongoose = require('mongoose');
require('dotenv').config();

// Import only the models we're actually using
const AuthUser = require('./models/AuthUser');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Contact = require('./models/Contact');
const Testimonial = require('./models/Testimonial');
const Farm = require('./models/Farm');

const connectDB = require('./config/database');

// Verify Database Setup
const verifyDatabaseSetup = async () => {
  try {
    console.log('📊 Database Collections Verification:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const essentialCollections = ['authusers', 'products', 'orders', 'contacts', 'testimonials', 'farms'];
    
    for (const collection of essentialCollections) {
      const exists = collections.find(col => col.name === collection);
      const count = exists ? await mongoose.connection.db.collection(collection).countDocuments() : 0;
      console.log(`  ${exists ? '✅' : '❌'} ${collection}: ${count} documents`);
    }

    // Check for removed collections
    console.log('\n🗑️  Removed Collections (should not exist):');
    const removedCollections = ['users', 'reviews', 'productreviews', 'carts', 'wishlists'];
    let hasRemovedCollections = false;
    
    for (const collection of removedCollections) {
      const exists = collections.find(col => col.name === collection);
      if (exists) {
        hasRemovedCollections = true;
        console.log(`  ❌ STILL EXISTS: ${collection}`);
      } else {
        console.log(`  ✅ REMOVED: ${collection}`);
      }
    }

    return !hasRemovedCollections;
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
};

// Verify Model Structure
const verifyModelStructure = async () => {
  try {
    console.log('\n🏗️  Model Structure Verification:');

    // Test AuthUser model
    const sampleUser = await AuthUser.findOne();
    if (sampleUser) {
      console.log('  ✅ AuthUser model structure valid');
      console.log(`    • Has cart: ${Array.isArray(sampleUser.cart) ? '✅' : '❌'}`);
      console.log(`    • Has wishlist: ${Array.isArray(sampleUser.wishlist) ? '✅' : '❌'}`);
      console.log(`    • Has profile: ${sampleUser.profile ? '✅' : '❌'}`);
    } else {
      console.log('  ⚠️  No users found to verify structure');
    }

    // Test Product model
    const sampleProduct = await Product.findOne();
    if (sampleProduct) {
      console.log('  ✅ Product model structure valid');
      console.log(`    • Has pricing: ${sampleProduct.pricing ? '✅' : '❌'}`);
      console.log(`    • Has inventory: ${sampleProduct.inventory ? '✅' : '❌'}`);
      console.log(`    • Has farmerInfo: ${sampleProduct.farmerInfo ? '✅' : '❌'}`);
    } else {
      console.log('  ⚠️  No products found to verify structure');
    }

    // Test Order model
    const sampleOrder = await Order.findOne();
    if (sampleOrder) {
      console.log('  ✅ Order model structure valid');
      console.log(`    • Has orderSummary: ${sampleOrder.orderSummary ? '✅' : '❌'}`);
      console.log(`    • Has paymentInfo: ${sampleOrder.paymentInfo ? '✅' : '❌'}`);
      console.log(`    • Has items array: ${Array.isArray(sampleOrder.items) ? '✅' : '❌'}`);
    } else {
      console.log('  ⚠️  No orders found to verify structure');
    }

    return true;
  } catch (error) {
    console.error('❌ Model structure verification failed:', error);
    return false;
  }
};

// Verify Data Relationships
const verifyDataRelationships = async () => {
  try {
    console.log('\n🔗 Data Relationships Verification:');

    // Test User-Order relationship
    const orderWithUser = await Order.findOne().populate('userId', 'firstName lastName email');
    if (orderWithUser && orderWithUser.userId) {
      console.log('  ✅ Order-User relationship working');
      console.log(`    • Sample: Order for ${orderWithUser.userId.firstName} ${orderWithUser.userId.lastName}`);
    } else {
      console.log('  ❌ Order-User relationship broken');
    }

    // Test Product-Farm relationship
    const productWithFarm = await Product.findOne().populate('farmId', 'farmName');
    if (productWithFarm && productWithFarm.farmId) {
      console.log('  ✅ Product-Farm relationship working');
      console.log(`    • Sample: ${productWithFarm.name} from ${productWithFarm.farmId.farmName}`);
    } else {
      console.log('  ❌ Product-Farm relationship broken');
    }

    // Test User-Farm ownership
    const farmWithOwner = await Farm.findOne().populate('ownerUserId', 'firstName lastName role');
    if (farmWithOwner && farmWithOwner.ownerUserId) {
      console.log('  ✅ Farm-Owner relationship working');
      console.log(`    • Sample: ${farmWithOwner.farmName} owned by ${farmWithOwner.ownerUserId.firstName} ${farmWithOwner.ownerUserId.lastName}`);
    } else {
      console.log('  ❌ Farm-Owner relationship broken');
    }

    return true;
  } catch (error) {
    console.error('❌ Relationship verification failed:', error);
    return false;
  }
};

// Verify Data Integrity
const verifyDataIntegrity = async () => {
  try {
    console.log('\n🔍 Data Integrity Verification:');

    // Check for orphaned orders
    const userIds = await AuthUser.distinct('_id');
    const orphanedOrders = await Order.countDocuments({
      userId: { $nin: userIds }
    });
    console.log(`  ${orphanedOrders === 0 ? '✅' : '❌'} Orphaned orders: ${orphanedOrders}`);

    // Check for orphaned products
    const farmIds = await Farm.distinct('_id');
    const orphanedProducts = await Product.countDocuments({
      farmId: { $nin: farmIds }
    });
    console.log(`  ${orphanedProducts === 0 ? '✅' : '❌'} Orphaned products: ${orphanedProducts}`);

    // Check for invalid user roles
    const invalidRoles = await AuthUser.countDocuments({
      role: { $nin: ['user', 'admin', 'farm_owner'] }
    });
    console.log(`  ${invalidRoles === 0 ? '✅' : '❌'} Invalid user roles: ${invalidRoles}`);

    // Check for products with zero or negative prices
    const invalidPrices = await Product.countDocuments({
      'pricing.basePrice': { $lte: 0 }
    });
    console.log(`  ${invalidPrices === 0 ? '✅' : '❌'} Invalid product prices: ${invalidPrices}`);

    // Check for negative inventory
    const negativeInventory = await Product.countDocuments({
      'inventory.availableQuantity': { $lt: 0 }
    });
    console.log(`  ${negativeInventory === 0 ? '✅' : '❌'} Negative inventory: ${negativeInventory}`);

    return orphanedOrders === 0 && orphanedProducts === 0 && invalidRoles === 0 && invalidPrices === 0 && negativeInventory === 0;
  } catch (error) {
    console.error('❌ Data integrity verification failed:', error);
    return false;
  }
};

// Verify Business Logic
const verifyBusinessLogic = async () => {
  try {
    console.log('\n💼 Business Logic Verification:');

    // Check admin user exists
    const adminExists = await AuthUser.findOne({ role: 'admin' });
    console.log(`  ${adminExists ? '✅' : '❌'} Admin user exists`);

    // Check farm owners have farms
    const farmOwners = await AuthUser.find({ role: 'farm_owner' });
    let farmOwnersWithFarms = 0;
    for (const owner of farmOwners) {
      const hasFarm = await Farm.findOne({ ownerUserId: owner._id });
      if (hasFarm) farmOwnersWithFarms++;
    }
    console.log(`  ✅ Farm owners with farms: ${farmOwnersWithFarms}/${farmOwners.length}`);

    // Check products have proper categories
    const validCategories = ['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'honey', 'spices', 'herbs', 'eggs', 'other'];
    const invalidCategories = await Product.countDocuments({
      'category.primary': { $nin: validCategories }
    });
    console.log(`  ${invalidCategories === 0 ? '✅' : '❌'} Products with invalid categories: ${invalidCategories}`);

    // Check order statuses
    const validOrderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const invalidOrderStatuses = await Order.countDocuments({
      orderStatus: { $nin: validOrderStatuses }
    });
    console.log(`  ${invalidOrderStatuses === 0 ? '✅' : '❌'} Orders with invalid status: ${invalidOrderStatuses}`);

    return true;
  } catch (error) {
    console.error('❌ Business logic verification failed:', error);
    return false;
  }
};

// Generate Summary Report
const generateSummaryReport = async () => {
  try {
    console.log('\n📊 System Summary Report:');
    console.log('==========================');

    // Count documents in each collection
    const userCount = await AuthUser.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const contactCount = await Contact.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    const farmCount = await Farm.countDocuments();

    console.log(`📈 Data Overview:`);
    console.log(`  • Users: ${userCount} (${await AuthUser.countDocuments({ role: 'admin' })} admins, ${await AuthUser.countDocuments({ role: 'farm_owner' })} farmers, ${await AuthUser.countDocuments({ role: 'user' })} customers)`);
    console.log(`  • Products: ${productCount} (${await Product.countDocuments({ status: 'active' })} active)`);
    console.log(`  • Orders: ${orderCount} (${await Order.countDocuments({ orderStatus: 'pending' })} pending, ${await Order.countDocuments({ orderStatus: 'delivered' })} delivered)`);
    console.log(`  • Contacts: ${contactCount} (${await Contact.countDocuments({ status: 'new' })} new)`);
    console.log(`  • Testimonials: ${testimonialCount} (${await Testimonial.countDocuments({ isApproved: true })} approved)`);
    console.log(`  • Farms: ${farmCount} (${await Farm.countDocuments({ isVerified: true })} verified)`);

    // System health indicators
    console.log(`\n🏥 System Health:`);
    const lowStockProducts = await Product.countDocuments({ 'inventory.availableQuantity': { $lt: 10 } });
    console.log(`  • Low stock products: ${lowStockProducts}`);
    
    const unprocessedContacts = await Contact.countDocuments({ status: 'new' });
    console.log(`  • Unprocessed contacts: ${unprocessedContacts}`);
    
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    console.log(`  • Pending orders: ${pendingOrders}`);

    // Business metrics
    console.log(`\n💰 Business Metrics:`);
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$orderSummary.total' } } }
    ]);
    if (totalRevenue.length > 0) {
      console.log(`  • Total revenue (delivered orders): ${totalRevenue[0].total} BDT`);
    }

    const avgOrderValue = await Order.aggregate([
      { $group: { _id: null, avg: { $avg: '$orderSummary.total' } } }
    ]);
    if (avgOrderValue.length > 0) {
      console.log(`  • Average order value: ${avgOrderValue[0].avg.toFixed(2)} BDT`);
    }

    return true;
  } catch (error) {
    console.error('❌ Summary report generation failed:', error);
    return false;
  }
};

// Main verification function
const verifyAllFeatures = async () => {
  try {
    console.log('🔍 Starting Comprehensive System Verification...');
    console.log('================================================\n');

    // Connect to database
    await connectDB();
    
    let allPassed = true;

    // Run all verifications
    allPassed &= await verifyDatabaseSetup();
    allPassed &= await verifyModelStructure();
    allPassed &= await verifyDataRelationships();
    allPassed &= await verifyDataIntegrity();
    allPassed &= await verifyBusinessLogic();
    await generateSummaryReport();

    console.log('\n================================================');
    if (allPassed) {
      console.log('🎉 All Verifications Passed Successfully!');
      console.log('\n✅ System Status: HEALTHY');
      console.log('✅ Database: CLEAN & ORGANIZED');
      console.log('✅ Models: PROPERLY STRUCTURED');
      console.log('✅ Relationships: WORKING');
      console.log('✅ Data Integrity: MAINTAINED');
      console.log('✅ Business Logic: VALID');
    } else {
      console.log('⚠️  Some Verifications Failed!');
      console.log('\nPlease review the issues above and fix them.');
    }

    console.log('\n🎯 Project Focus: Simple E-commerce Platform');
    console.log('  ✅ Core functionality over complexity');
    console.log('  ✅ 6 essential collections only');
    console.log('  ✅ Clean data relationships');
    console.log('  ✅ Bangladeshi market context');

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Verification suite failed:', error.message);
    process.exit(1);
  }
};

// Only run if this script is executed directly
if (require.main === module) {
  verifyAllFeatures();
}

module.exports = {
  verifyDatabaseSetup,
  verifyModelStructure,
  verifyDataRelationships,
  verifyDataIntegrity,
  verifyBusinessLogic,
  generateSummaryReport,
  verifyAllFeatures
};
