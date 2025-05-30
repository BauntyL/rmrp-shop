import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway"
});

const dropTablesQuery = `
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS car_applications CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;

async function dropTables() {
  try {
    console.log('Dropping tables...');
    const client = await pool.connect();
    
    await client.query(dropTablesQuery);
    console.log('Tables dropped successfully');
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error dropping tables:', err);
  }
}

dropTables(); 