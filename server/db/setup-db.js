// Устанавливаем переменные окружения
process.env.DATABASE_URL = 'postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway';
process.env.NODE_ENV = 'development';

// Импортируем необходимые модули
const initializeDatabase = require('./init-db');

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