// Test script to verify users management works

async function testUsersManagement() {
  const baseUrl = 'http://localhost:18562/api';
  const adminToken = 'admin-token';
  
  console.log('Testing users management...');
  
  try {
    // Test users endpoint
    console.log('\n1. Testing GET /api/users');
    const usersResponse = await fetch(`${baseUrl}/users?limit=5`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const usersData = await usersResponse.json();
    console.log('Status:', usersResponse.status);
    
    if (usersData.success && usersData.data.users) {
      console.log(`Found ${usersData.data.users.length} users:`);
      usersData.data.users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Full Name: ${user.fullName}`);
        console.log('   ---');
      });
    } else {
      console.log('Response:', JSON.stringify(usersData, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing users management:', error.message);
  }
}

// Run the test
testUsersManagement();
