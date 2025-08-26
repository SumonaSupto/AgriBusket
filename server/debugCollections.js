const mongoose = require('mongoose');

// Import all models to see which collections they create
const AuthUser = require('./models/AuthUser');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Farm = require('./models/Farm');
const ProductReview = require('./models/ProductReview');
const Contact = require('./models/Contact');
const Testimonial = require('./models/Testimonial');

async function debugCollections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sandbox_db');
    console.log('🔍 DEBUGGING COLLECTION USAGE...\n');
    
    // Get all collections in database
    const dbCollections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Collections in Database:');
    for (const col of dbCollections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }
    
    console.log('\n🔍 Model-to-Collection Mapping:');
    
    // Check which collections each model creates
    const modelMappings = [
      { name: 'AuthUser', model: AuthUser, expectedCollection: 'authusers' },
      { name: 'Product', model: Product, expectedCollection: 'products' },
      { name: 'Order', model: Order, expectedCollection: 'orders' },
      { name: 'Farm', model: Farm, expectedCollection: 'farms' },
      { name: 'ProductReview', model: ProductReview, expectedCollection: 'productreviews' },
      { name: 'Contact', model: Contact, expectedCollection: 'contacts' },
      { name: 'Testimonial', model: Testimonial, expectedCollection: 'testimonials' }
    ];
    
    for (const mapping of modelMappings) {
      try {
        const collectionName = mapping.model.collection.name;
        const exists = dbCollections.find(col => col.name === collectionName);
        const count = exists ? await mongoose.connection.db.collection(collectionName).countDocuments() : 0;
        
        console.log(`  ${mapping.name} → ${collectionName} (${count} docs) ${exists ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`  ${mapping.name} → ERROR: ${error.message}`);
      }
    }
    
    console.log('\n🔄 ROUTE FILE ANALYSIS:');
    
    // Routes that are actively used
    const routeFiles = [
      { file: 'auth.js', models: ['AuthUser', 'User'] },
      { file: 'products.js', models: ['Product'] },
      { file: 'orders.js', models: ['Order', 'Product', 'User', 'Farm', 'Cart'] },
      { file: 'payment.js', models: ['Order', 'AuthUser'] },
      { file: 'reviews.js', models: ['ProductReview', 'Product', 'Order', 'User'] }
    ];
    
    for (const route of routeFiles) {
      console.log(`  📁 ${route.file}:`);
      for (const modelName of route.models) {
        const mapping = modelMappings.find(m => m.name === modelName);
        if (mapping) {
          const collectionName = mapping.model.collection.name;
          const exists = dbCollections.find(col => col.name === collectionName);
          const count = exists ? await mongoose.connection.db.collection(collectionName).countDocuments() : 0;
          console.log(`    - ${modelName} → ${collectionName} (${count} docs) ${exists ? '✅' : '❌'}`);
        }
      }
    }
    
    console.log('\n❌ COLLECTIONS WITH ISSUES:');
    
    // Check for Enhanced collections that shouldn't be used
    const enhancedCollections = dbCollections.filter(col => 
      col.name.includes('enhanced') || 
      col.name === 'users' // users vs authusers conflict
    );
    
    if (enhancedCollections.length > 0) {
      console.log('  🚨 Conflicting Collections Found:');
      for (const col of enhancedCollections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`    - ${col.name}: ${count} documents (SHOULD NOT BE USED)`);
      }
    } else {
      console.log('  ✅ No conflicting collections found');
    }
    
    console.log('\n📋 RECOMMENDED ACTIONS:');
    
    // Check if we need to migrate or clean up
    const authUsersCount = await mongoose.connection.db.collection('authusers').countDocuments();
    const usersCount = dbCollections.find(col => col.name === 'users') ? 
      await mongoose.connection.db.collection('users').countDocuments() : 0;
    
    const productsCount = await mongoose.connection.db.collection('products').countDocuments();
    const enhancedProductsCount = dbCollections.find(col => col.name === 'enhancedproducts') ? 
      await mongoose.connection.db.collection('enhancedproducts').countDocuments() : 0;
    
    if (usersCount > 0) {
      console.log(`  🔄 Migrate ${usersCount} users to authusers collection`);
    }
    
    if (enhancedProductsCount > 0) {
      console.log(`  🔄 Migrate ${enhancedProductsCount} enhanced products to products collection`);
    }
    
    const enhancedUsersCount = dbCollections.find(col => col.name === 'enhancedusers') ? 
      await mongoose.connection.db.collection('enhancedusers').countDocuments() : 0;
    
    if (enhancedUsersCount > 0) {
      console.log(`  🔄 Migrate ${enhancedUsersCount} enhanced users to authusers collection`);
    }
    
    // Empty collections that can be dropped
    const emptyCollections = [];
    for (const col of dbCollections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      if (count === 0) {
        emptyCollections.push(col.name);
      }
    }
    
    if (emptyCollections.length > 0) {
      console.log(`  🗑️  Drop ${emptyCollections.length} empty collections: ${emptyCollections.join(', ')}`);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Debug Error:', error);
  }
}

debugCollections();
