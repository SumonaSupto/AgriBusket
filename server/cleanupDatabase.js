const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');

const cleanupDatabase = async () => {
  try {
    await connectDB();
    console.log('🧹 Starting database cleanup...\n');

    // List of unused collections to remove
    const unusedCollections = [
      'users',           // Conflicts with authusers
      'settings',        // Empty and unused
      'notifications',   // Empty and unused  
      'coupons',         // Empty and unused
      'carts',           // Empty and unused (cart data stored in user model)
      'paymentmethods',  // Empty and unused
      'reviews',         // Empty and unused (using productreviews)
      'addresses',       // Empty and unused (addresses stored in user model)
      'productreviews',  // Empty and unused
      'farmreviews',     // Empty and unused
      'categories',      // Empty and unused
      'wishlists'        // Empty and unused (wishlist stored in user model)
    ];

    console.log('📋 Collections to be removed:');
    unusedCollections.forEach(collection => {
      console.log(`  ❌ ${collection}`);
    });

    console.log('\n🔍 Checking collections before cleanup...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const existingCollections = collections.map(col => col.name);

    for (const collectionName of unusedCollections) {
      if (existingCollections.includes(collectionName)) {
        try {
          const count = await mongoose.connection.db.collection(collectionName).countDocuments();
          console.log(`\n🗑️  Dropping collection: ${collectionName} (${count} documents)`);
          
          if (count === 0) {
            await mongoose.connection.db.dropCollection(collectionName);
            console.log(`  ✅ Successfully dropped ${collectionName}`);
          } else {
            console.log(`  ⚠️  Collection ${collectionName} has ${count} documents - skipping for safety`);
          }
        } catch (error) {
          if (error.codeName === 'NamespaceNotFound') {
            console.log(`  ℹ️  Collection ${collectionName} doesn't exist`);
          } else {
            console.log(`  ❌ Error dropping ${collectionName}:`, error.message);
          }
        }
      } else {
        console.log(`  ℹ️  Collection ${collectionName} doesn't exist`);
      }
    }

    console.log('\n📊 Final database state:');
    const finalCollections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of finalCollections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      const status = count > 0 ? '✅' : '⚪';
      console.log(`  ${status} ${collection.name}: ${count} documents`);
    }

    console.log('\n🎉 Database cleanup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
};

// Only run if this script is executed directly
if (require.main === module) {
  cleanupDatabase();
}

module.exports = cleanupDatabase;
