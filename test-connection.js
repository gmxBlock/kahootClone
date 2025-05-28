// Test script to check server connection and rate limiting
const testServerConnection = async () => {
  const serverUrl = 'http://165.22.18.156:3000';
  
  console.log('🧪 Testing server connection and rate limiting...');
  console.log('Server URL:', serverUrl);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${serverUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test API health endpoint
    console.log('\n2. Testing API health endpoint...');
    const apiHealthResponse = await fetch(`${serverUrl}/api/health`);
    const apiHealthData = await apiHealthResponse.json();
    console.log('✅ API health check:', apiHealthData);
    
    // Test rate limiting by making multiple requests
    console.log('\n3. Testing rate limiting...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(fetch(`${serverUrl}/api/health`));
    }
    
    const responses = await Promise.all(promises);
    const results = await Promise.all(responses.map(r => r.json()));
    
    console.log('✅ Multiple requests successful');
    console.log('Rate limit headers:', responses[0].headers.get('RateLimit-Remaining'));
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 Suggestions:');
      console.log('- Check if server is running on port 3000');
      console.log('- Verify firewall settings');
      console.log('- Ensure the IP address is correct');
    }
  }
};

// Run the test
testServerConnection();
