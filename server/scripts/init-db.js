require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  try {
    console.log('🗄️  Инициализация базы данных...');
    
    // Создаем таблицу пользователей
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        terms_accepted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);
    console.log('✅ Таблица users создана/обновлена');

    // Создаем индексы для оптимизации
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;

    await pool.query(createIndexes);
    console.log('✅ Индексы созданы');

    // Проверяем подключение
    const testQuery = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✅ База данных готова. Пользователей в системе: ${testQuery.rows[0].count}`);

  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Запускаем инициализацию
initDatabase();