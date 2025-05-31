// server.js - точка входа для продакшн сервера
import { config } from 'dotenv';
config();

// Импортируем скомпилированное приложение
import('./server/dist/index.js').catch(error => {
  console.error('Ошибка при запуске сервера:', error);
  process.exit(1);
});