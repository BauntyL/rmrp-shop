const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // увеличиваем таймаут до 10 секунд
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Connection successful:', result.rows[0]);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testConnection(); 