const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔄 Подключение к базе...');
    
    // Проверяем существующих пользователей
    const users = await pool.query('SELECT * FROM users');
    console.log('👥 Найдено пользователей:', users.rows.length);
    
    // Обновляем пользователя до админа
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE username = 'Баунти Миллер' RETURNING *"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Пользователь стал админом:', result.rows[0]);
    } else {
      console.log('❌ Пользователь "Баунти Миллер" не найден');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
