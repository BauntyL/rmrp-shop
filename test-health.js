import fetch from 'node-fetch';

async function testHealth() {
  try {
    console.log('Testing server health...');
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    console.log('Health check response:', data);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testHealth(); 