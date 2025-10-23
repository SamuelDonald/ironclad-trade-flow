// Complete test for balance update functionality
// This simulates the exact request the frontend would make

async function testCompleteBalanceUpdate() {
  console.log('=== Complete Balance Update Test ===');
  
  try {
    // Import supabase client (this would normally be done via import)
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabaseUrl = 'https://jgedidtpqfashojqagbd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZWRpZHRwcWZhc2hvanFhZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDcyNDksImV4cCI6MjA3NDQyMzI0OX0.S-xJ6DarxU5Q-pl2jJfJmLvv5uKGQHa3CqfejXGO-gA';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('1. Supabase client created');
    console.log('   - URL:', supabaseUrl);
    console.log('   - Key length:', supabaseKey.length);
    
    // Test request body (same format as frontend)
    const testRequestBody = {
      userId: 'test-user-id-123',
      mode: 'delta',
      cashBalance: 100,
      reason: 'Debug test from browser'
    };
    
    console.log('2. Test request body:', testRequestBody);
    console.log('   - Stringified:', JSON.stringify(testRequestBody));
    
    // Test the function call
    console.log('3. Calling balance-update function...');
    
    const { data, error } = await supabase.functions.invoke('balance-update', {
      body: testRequestBody
    });
    
    console.log('4. Function call completed');
    console.log('   - Has data:', !!data);
    console.log('   - Has error:', !!error);
    console.log('   - Data:', data);
    console.log('   - Error:', error);
    
    if (error) {
      console.log('5. Error details:');
      console.log('   - Message:', error.message);
      console.log('   - Status:', error.status);
      console.log('   - Context:', error.context);
      console.log('   - Name:', error.name);
    }
    
    if (data) {
      console.log('5. Success response:', data);
    }
    
  } catch (err) {
    console.error('6. Exception caught:', err);
    console.error('   - Message:', err.message);
    console.error('   - Stack:', err.stack);
  }
}

// Run the test
testCompleteBalanceUpdate();
