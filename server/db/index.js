const { Pool } = require('pg');
const logger = require('../logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Функция проверки подключения к базе данных
async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return result.rows[0];
  } catch (error) {
    logger.error('Database connection check failed', { error: error.message });
    throw error;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  checkConnection
}; 