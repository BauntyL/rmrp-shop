import { pool } from '../config/database';
import logger from '../logger';

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