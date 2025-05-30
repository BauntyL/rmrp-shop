import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway"
});

const createTablesQuery = `
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

async function createTables() {
  try {
    console.log('Creating tables...');
    const client = await pool.connect();
    
    await client.query(createTablesQuery);
    console.log('Tables created successfully');
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error creating tables:', err);
  }
}

createTables(); 