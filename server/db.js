const path = require('path');
const { Pool } = require('pg');
const logger = require('./logger');
const config = require('./config');

// Исправляем путь к .env - он должен быть в корневой папке проекта
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Проверка, что переменная DATABASE_URL загружена
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not found');

// Создаем пул соединений
const pool = new Pool({
  connectionString: config.database.url,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // время простоя клиента
  connectionTimeoutMillis: 5000, // увеличенное время ожидания соединения
});

// Обработка ошибок пула
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', { error: err.message });
});

// Проверка соединения
async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Database connection successful', {
      timestamp: result.rows[0].now
    });
    
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
}

// Функция для выполнения запроса с автоматическим освобождением клиента
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Executed query', {
      text,
      duration,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    logger.error('Query error', {
      text,
      error: error.message
    });
    throw error;
  }
}

async function initDb() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Проверяем соединение
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function initializeTables() {
  try {
    console.log("🔧 Initializing database tables...");
    
    // СОЗДАЕМ ТАБЛИЦУ ПОЛЬЗОВАТЕЛЕЙ
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

async function createDefaultAdmin() {
  try {
    const adminCheck = await pool.query(
      'SELECT * FROM users WHERE role = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      console.log('🌱 Creating default admin...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Lqlcpyvb555!999#81', 10);
      
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['Баунти Миллер', hashedPassword, 'admin']
      );
      
      console.log('✅ Default admin created: Баунти Миллер / Lqlcpyvb555!999#81');
    } else {
      console.log('✅ Admin exists:', adminCheck.rows[0].username);
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

module.exports = {
  pool,
  query,
  checkConnection,
  initDb,
  initializeTables,
  createDefaultAdmin
};