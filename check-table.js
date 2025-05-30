import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway"
});

async function checkTable() {
  try {
    console.log('Checking table structure...');
    const client = await pool.connect();
    
    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('Table structure:');
    console.table(res.rows);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error checking table:', err);
  }
}

checkTable(); 