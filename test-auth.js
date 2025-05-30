import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    // Тестируем регистрацию
    console.log('Testing registration...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Иван Иванов',
        password: 'test123',
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    // Тестируем вход
    console.log('\nTesting login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Иван Иванов',
        password: 'test123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

  } catch (err) {
    console.error('Test error:', err);
  }
}

testAuth(); 