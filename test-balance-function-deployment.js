// Test script to check if balance-update function is deployed
// Run this in browser console

async function testBalanceFunctionDeployment() {
  console.log('=== Testing Balance Function Deployment ===');
  
  try {
    // Test 1: Check if function exists (should get 401 for unauthorized, not 404 for not found)
    const response = await fetch('https://jgedidtpqfashojqagbd.supabase.co/functions/v1/balance-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'deployment' })
    });
    
    console.log('Function deployment test:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('- Response Body:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Function is deployed (401 Unauthorized is expected without auth)');
    } else if (response.status === 404) {
      console.log('❌ Function is NOT deployed (404 Not Found)');
    } else {
      console.log('⚠️ Unexpected response:', response.status);
    }
    
  } catch (error) {
    console.error('Error testing function deployment:', error);
  }
}

// Run the test
testBalanceFunctionDeployment();
