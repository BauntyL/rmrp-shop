const fs = require('fs');
const path = require('path');
const { pool } = require('../db');
const logger = require('../logger');

async function initializeDatabase() {
  try {
    logger.info('Starting database initialization');

    // Читаем SQL файл
    const sqlFile = path.join(__dirname, 'init.sql');
    const sqlQueries = fs.readFileSync(sqlFile, 'utf8');

    // Выполняем SQL запросы
    await pool.query(sqlQueries);
    
    logger.info('Database tables created successfully');

    // Проверяем наличие админа
    const adminCheck = await pool.query(
      'SELECT * FROM users WHERE role = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      logger.info('Creating default admin user');
      
      const bcrypt = require('bcrypt');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      
      logger.info('Default admin user created');
    }

    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    throw error;
  }
}

// Если скрипт запущен напрямую
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info('Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization script failed', { error: error.message });
      process.exit(1);
    });
}

module.exports = initializeDatabase; 