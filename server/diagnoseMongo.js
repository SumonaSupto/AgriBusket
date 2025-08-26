const mongoose = require('mongoose');
require('dotenv').config();

const testMultipleConnections = async () => {
  console.log('🔍 MongoDB Connection Diagnostics\n');
  
  const scenarios = [
    {
      name: 'Test 1: No Authentication',
      uri: 'mongodb://localhost:27017/sandbox_db'
    },
    {
      name: 'Test 2: With Authentication (authSource=admin)',
      uri: 'mongodb://sandbox:sandbox@localhost:27017/sandbox_db?authSource=admin'
    },
    {
      name: 'Test 3: With Authentication (authSource=sandbox_db)',
      uri: 'mongodb://sandbox:sandbox@localhost:27017/sandbox_db?authSource=sandbox_db'
    },
    {
      name: 'Test 4: Default database',
      uri: 'mongodb://localhost:27017'
    },
    {
      name: 'Test 5: Admin database',
      uri: 'mongodb://localhost:27017/admin'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 ${scenario.name}`);
    console.log(`🔗 URI: ${scenario.uri.replace(/\/\/.*@/, '//***:***@')}`);
    
    try {
      const conn = await mongoose.connect(scenario.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000 // 3 second timeout
      });

      console.log('✅ Connection successful!');
      console.log(`🏠 Host: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      
      // Try to list databases
      try {
        const adminDb = conn.connection.db.admin();
        const dbs = await adminDb.listDatabases();
        console.log('📋 Available databases:');
        dbs.databases.forEach(db => console.log(`  - ${db.name}`));
      } catch (listError) {
        console.log('⚠️  Could not list databases (permission issue)');
      }
      
      await mongoose.connection.close();
      console.log('✅ Connection closed');
      break; // If this works, we found our solution
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n🔧 MongoDB Setup Commands:');
  console.log('If no connection worked, you may need to set up MongoDB:');
  console.log('\n1. Start MongoDB:');
  console.log('   Windows: net start MongoDB');
  console.log('   Linux: sudo systemctl start mongod');
  console.log('   Mac: brew services start mongodb/brew/mongodb-community');
  
  console.log('\n2. Create user and database:');
  console.log('   mongo');
  console.log('   use sandbox_db');
  console.log('   db.createUser({');
  console.log('     user: "sandbox",');
  console.log('     pwd: "sandbox",');
  console.log('     roles: ["readWrite"]');
  console.log('   })');
  
  console.log('\n3. Alternative: Use without authentication:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/sandbox_db');
  
  process.exit(0);
};

testMultipleConnections();
