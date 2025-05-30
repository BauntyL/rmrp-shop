import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway"
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('Successfully connected to database');
    
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0]);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

testConnection(); 