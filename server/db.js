const path = require('path');
const { Pool } = require('pg');

// Исправляем путь к .env - он должен быть в корневой папке проекта
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Проверка, что переменная DATABASE_URL загружена
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not found');

// Создаем пул соединений
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false
});

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
  initDb,
  initializeTables,
  createDefaultAdmin
};