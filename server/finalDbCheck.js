const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n=== FINAL DATABASE STATE ===');
    console.log('Total collections:', collections.length);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📊 ${collection.name}: ${count} documents`);
    }
    
    console.log('\n=== COLLECTION VERIFICATION ===');
    const requiredCollections = ['authusers', 'products', 'orders', 'farms'];
    const missingCollections = [];
    
    for (const reqCollection of requiredCollections) {
      const exists = collections.find(c => c.name === reqCollection);
      if (!exists) {
        missingCollections.push(reqCollection);
      }
    }
    
    if (missingCollections.length > 0) {
      console.log('❌ Missing required collections:', missingCollections);
    } else {
      console.log('✅ All required collections exist');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Database check error:', error.message);
  }
}

checkDatabase();
