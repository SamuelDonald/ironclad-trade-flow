// Debug script to test balance-update function
// Run this in browser console to test the function call

async function testBalanceUpdate() {
  console.log('=== Testing Balance Update Function ===');
  
  // Get the supabase client from the page
  const { supabase } = await import('/src/integrations/supabase/client.ts');
  
  console.log('Supabase client:', supabase);
  console.log('Supabase URL:', supabase.supabaseUrl);
  
  // Test request body
  const testRequestBody = {
    userId: 'test-user-id',
    mode: 'delta',
    cashBalance: 100,
    reason: 'Debug test'
  };
  
  console.log('Test request body:', testRequestBody);
  console.log('Stringified body:', JSON.stringify(testRequestBody));
  
  try {
    console.log('Calling balance-update function...');
    const { data, error } = await supabase.functions.invoke('balance-update', {
      body: testRequestBody
    });
    
    console.log('Response data:', data);
    console.log('Response error:', error);
    
    if (error) {
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        context: error.context,
        name: error.name
      });
    }
    
  } catch (err) {
    console.error('Exception caught:', err);
  }
}

// Run the test
testBalanceUpdate();
