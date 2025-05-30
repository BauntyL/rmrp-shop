const { initDb, initializeTables, createDefaultAdmin } = require('../db');
const logger = require('../logger');

async function initialize() {
  try {
    logger.info('Starting database initialization...');
    
    // Подключение к базе данных
    await initDb();
    logger.info('Database connection established');
    
    // Создание таблиц
    await initializeTables();
    logger.info('Database tables created');
    
    // Создание администратора по умолчанию
    await createDefaultAdmin();
    logger.info('Default admin user created');
    
    logger.info('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initialize(); 