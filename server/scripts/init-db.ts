import pool from '../config/database.js';
import { createUsersTableSQL } from '../models/user.js';

async function initDatabase() {
  try {
    // Создаем таблицу пользователей
    await pool.query(createUsersTableSQL);
    console.log('База данных успешно инициализирована');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

initDatabase(); 