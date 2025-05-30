import pg from 'pg';
import logger from '../logger/index.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway"
});

async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return result.rows[0];
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

export { pool, checkConnection }; 