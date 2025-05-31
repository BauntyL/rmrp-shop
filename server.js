require("dotenv").config();

// Установка переменных окружения
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

console.log('🚀 Starting RMRP Shop...');
console.log(`Запуск приложения в режиме ${process.env.NODE_ENV} на порту ${process.env.PORT}`);

// Запуск скомпилированного приложения
try {
  require('./dist/server/index.js');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}