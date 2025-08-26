// Comprehensive dashboard test
const testDashboardData = async () => {
  console.log('🧪 Testing Full Dashboard Data Flow...\n');
  
  const token = 'admin-token'; // Using the same token as the admin panel
  
  try {
    // Test 1: Dashboard Stats
    console.log('1️⃣ Testing Dashboard Stats...');
    try {
      const statsRes = await fetch('http://localhost:18562/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('✅ Dashboard stats API working');
        console.log('   Stats data:', JSON.stringify(statsData, null, 2));
      } else {
        console.log('❌ Dashboard stats API failed with status:', statsRes.status);
      }
    } catch (error) {
      console.log('❌ Dashboard stats API error:', error.message);
    }
    
    // Test 2: Recent Orders
    console.log('\n2️⃣ Testing Recent Orders...');
    try {
      const ordersRes = await fetch('http://localhost:18562/api/admin/dashboard/recent-orders?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        console.log('✅ Recent orders API working');
        console.log(`   Found ${ordersData.data?.length || 0} orders`);
        
        if (ordersData.data && ordersData.data.length > 0) {
          const firstOrder = ordersData.data[0];
          console.log('   First order sample:');
          console.log(`     ID: ${firstOrder.id}`);
          console.log(`     Customer: ${firstOrder.customer}`);
          console.log(`     Products: ${firstOrder.products}`);
          console.log(`     Amount: ${firstOrder.amount}`);
          console.log(`     Status: ${firstOrder.status}`);
        }
      } else {
        console.log('❌ Recent orders API failed with status:', ordersRes.status);
      }
    } catch (error) {
      console.log('❌ Recent orders API error:', error.message);
    }
    
    // Test 3: Products for low stock calculation
    console.log('\n3️⃣ Testing Products for Low Stock...');
    try {
      const response = await fetch('http://localhost:18562/api/products');
      const data = await response.json();
      
      if (data.success && data.data?.products) {
        const lowStockCount = data.data.products.filter(product => 
          (product.inventory?.availableQuantity || product.inventory?.quantity || 0) <= 10
        ).length;
        
        console.log('✅ Products API working');
        console.log(`   Total products: ${data.data.products.length}`);
        console.log(`   Low stock products: ${lowStockCount}`);
      } else {
        console.log('❌ Products API failed');
      }
    } catch (error) {
      console.log('❌ Products API error:', error.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log('If recent orders show amounts correctly above, then the API is working.');
    console.log('If the admin panel still shows missing amounts, it might be a frontend caching or state issue.');
    
  } catch (error) {
    console.error('❌ Overall test failed:', error.message);
  }
};

// Run the test
testDashboardData();
