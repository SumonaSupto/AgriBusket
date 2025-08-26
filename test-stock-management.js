// Test script for stock management functionality
const testStockManagement = async () => {
  const baseURL = 'http://localhost:18562/api';
  
  console.log('🧪 Testing Stock Management API...\n');
  
  try {
    // First, get all products
    console.log('📦 Fetching products...');
    const productsResponse = await fetch(`${baseURL}/products`);
    const productsData = await productsResponse.json();
    
    if (!productsData.success || !productsData.data?.products?.length) {
      console.log('❌ No products found or failed to fetch products');
      return;
    }
    
    const product = productsData.data.products[0];
    console.log(`✅ Found product: ${product.name}`);
    console.log(`   Current stock: ${product.inventory?.availableQuantity || product.inventory?.quantity || 0}`);
    
    // Test stock update endpoint
    const testCases = [
      { operation: 'add', quantity: 5, description: 'Add 5 units' },
      { operation: 'subtract', quantity: 2, description: 'Remove 2 units' },
      { operation: 'set', quantity: 20, description: 'Set to 20 units' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Testing: ${testCase.description}`);
      
      const stockResponse = await fetch(`${baseURL}/products/${product._id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // Using basic auth for test
        },
        body: JSON.stringify({
          operation: testCase.operation,
          quantity: testCase.quantity
        })
      });
      
      const stockData = await stockResponse.json();
      
      if (stockData.success) {
        console.log(`✅ ${testCase.description} successful`);
        console.log(`   Old quantity: ${stockData.data.oldQuantity}`);
        console.log(`   New quantity: ${stockData.data.newQuantity}`);
      } else {
        console.log(`❌ ${testCase.description} failed: ${stockData.message}`);
      }
    }
    
    console.log('\n🎉 Stock management tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testStockManagement();
