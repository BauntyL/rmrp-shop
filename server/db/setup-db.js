// Загружаем переменные окружения из .env файла
require('dotenv').config({ path: '../../.env' });

// Импортируем необходимые модули
const initializeDatabase = require('./init-db');

// Проверяем наличие DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in the environment variables.');
  process.exit(1);
}

// Запускаем инициализацию
initializeDatabase()
  .then(() => {
    console.log('Database setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });