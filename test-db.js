const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  query_timeout: 10000
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    console.log('Connection string:', 'postgresql://postgres:***@tramway.proxy.rlwy.net:41435/railway');
    
    const client = await pool.connect();
    console.log('Successfully connected to the pool');
    
    const result = await client.query('SELECT NOW()');
    console.log('Query executed successfully:', result.rows[0]);
    
    client.release();
    console.log('Client released');
    
    await pool.end();
    console.log('Pool ended');
  } catch (error) {
    console.error('Connection error:', error);
    console.error('Error stack:', error.stack);
  }
}

testConnection(); 