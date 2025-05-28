// Connection test utility for debugging server connectivity issues
import { API_BASE_URL, SOCKET_URL } from './constants';

export const testServerConnection = async () => {
  console.log('🔍 Testing server connections...');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('SOCKET_URL:', SOCKET_URL);
  
  const results = {
    apiHealth: false,
    socketReachable: false,
    errors: []
  };

  // Test API connection
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Health Check Passed:', data);
      results.apiHealth = true;
    } else {
      console.error('❌ API Health Check Failed:', response.status, response.statusText);
      results.errors.push(`API returned ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ API Connection Failed:', error.message);
    results.errors.push(`API connection failed: ${error.message}`);
  }

  // Test Socket.IO endpoint reachability
  try {
    const socketHealthUrl = `${SOCKET_URL}/socket.io/`;
    const response = await fetch(socketHealthUrl, {
      method: 'GET',
      timeout: 5000
    });
    
    // Socket.IO typically returns a specific response
    console.log('🔌 Socket.IO endpoint response status:', response.status);
    if (response.status === 200 || response.status === 400) {
      // Status 400 is normal for Socket.IO without proper handshake
      console.log('✅ Socket.IO endpoint is reachable');
      results.socketReachable = true;
    } else {
      console.error('❌ Socket.IO endpoint returned unexpected status:', response.status);
      results.errors.push(`Socket.IO endpoint returned ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Socket.IO endpoint unreachable:', error.message);
    results.errors.push(`Socket.IO endpoint unreachable: ${error.message}`);
  }

  // Print summary
  console.log('\n📊 Connection Test Summary:');
  console.log('API Health:', results.apiHealth ? '✅ PASS' : '❌ FAIL');
  console.log('Socket Reachable:', results.socketReachable ? '✅ PASS' : '❌ FAIL');
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors found:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    console.log('\n💡 Troubleshooting suggestions:');
    console.log('1. Verify your server is running');
    console.log('2. Check the URLs in your .env file');
    console.log('3. Ensure no firewall is blocking the connection');
    console.log('4. Test the health endpoint directly in a browser:', `${API_BASE_URL.replace('/api', '')}/health`);
  }

  return results;
};

// Quick connection test that can be called from console
export const quickTest = () => {
  console.log('🚀 Quick Connection Test');
  console.log('Current configuration:');
  console.log('- API URL:', API_BASE_URL);
  console.log('- Socket URL:', SOCKET_URL);
  console.log('\nTesting connections...');
  
  return testServerConnection();
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.testConnection = quickTest;
  console.log('💡 Debug tip: Run window.testConnection() in the browser console to test your server connection');
}
