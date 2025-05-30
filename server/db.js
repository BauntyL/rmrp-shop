const path = require('path');
const { Client } = require('pg');

// Исправляем путь к .env - он должен быть в корневой папке проекта
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Проверка, что переменная DATABASE_URL загружена
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not found');

let client;

async function initDb() {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.error('Make sure .env file exists in the root directory');
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('🔄 Connecting to database...');
    
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Database connected successfully');

    // Initialize tables
    await initializeTables();
    
    // Create default admin
    await createDefaultAdmin();

    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function initializeTables() {
  try {
    console.log("🔧 Initializing database tables...");
    
    // СОЗДАЕМ ТАБЛИЦУ ПОЛЬЗОВАТЕЛЕЙ
    await client.query(`
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
    const adminCheck = await client.query(
      'SELECT * FROM users WHERE role = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      console.log('🌱 Creating default admin...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Lqlcpyvb555!999#81', 10);
      
      await client.query(
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

function getClient() {
  if (!client) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return client;
}

module.exports = {
  initDb,
  getClient
};