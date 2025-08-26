const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sandbox_db';
    const dbName = process.env.MONGODB_DATABASE || 'sandbox_db';
    
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    console.log(`Target database: ${dbName}`);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: dbName
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MongoDB is running locally on port 27017');
    console.error('💡 You can start MongoDB with: mongod --dbpath /path/to/data');
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Create indexes for better query performance
    const db = mongoose.connection.db;
    
    // Products collection indexes
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ farmerId: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Orders collection indexes
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ orderDate: -1 });
    await db.collection('orders').createIndex({ status: 1 });
    
    // Reviews collection indexes
    await db.collection('reviews').createIndex({ productId: 1 });
    await db.collection('reviews').createIndex({ userId: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.log('⚠️  Index creation warning:', error.message);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

module.exports = connectDB;
