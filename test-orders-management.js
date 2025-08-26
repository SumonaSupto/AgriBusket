// Test script to verify order management works
async function testOrdersManagement() {
  const baseUrl = 'http://localhost:18562/api';
  const adminToken = 'admin-token';
  
  console.log('Testing orders management...');
  
  try {
    // Test orders endpoint
    console.log('\n1. Testing GET /api/orders/admin/all');
    const ordersResponse = await fetch(`${baseUrl}/orders/admin/all?limit=3`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const ordersData = await ordersResponse.json();
    console.log('Status:', ordersResponse.status);
    
    if (ordersData.success && ordersData.data.orders) {
      console.log(`Found ${ordersData.data.orders.length} orders:`);
      ordersData.data.orders.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order.orderId}`);
        console.log(`   Customer: ${order.customerInfo?.name}`);
        console.log(`   Email: ${order.customerInfo?.email}`);
        console.log(`   Pricing Total: ৳${order.pricing?.total}`);
        console.log(`   Summary Total: ৳${order.summary?.totalAmount}`);
        console.log(`   Status: ${order.orderStatus}`);
        console.log(`   Date: ${order.createdAt}`);
        console.log('   ---');
      });
    } else {
      console.log('Response:', JSON.stringify(ordersData, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing orders management:', error.message);
  }
}

// Run the test
testOrdersManagement();
