// Test script for admin dashboard recent orders
const testRecentOrders = async () => {
  console.log('🧪 Testing Recent Orders Dashboard...\n');
  
  try {
    const response = await fetch('http://localhost:18562/api/admin/dashboard/recent-orders?limit=3');
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ Recent Orders API is working!');
      console.log(`📊 Found ${data.data.length} recent orders:\n`);
      
      data.data.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order.id}`);
        console.log(`   Customer: ${order.customer}`);
        console.log(`   Products: ${order.products}`);
        console.log(`   Amount: ${order.amount}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Date: ${new Date(order.date).toLocaleDateString()}\n`);
      });
      
      // Check if amounts are showing correctly
      const hasValidAmounts = data.data.every(order => 
        order.amount && order.amount.includes('৳') && !order.amount.includes('undefined')
      );
      
      if (hasValidAmounts) {
        console.log('✅ All orders have valid amount formatting!');
      } else {
        console.log('❌ Some orders have invalid amount formatting!');
      }
      
    } else {
      console.log('❌ API request failed or returned no data');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testRecentOrders();
