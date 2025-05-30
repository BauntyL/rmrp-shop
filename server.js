require("dotenv").config();

// Установка переменных окружения
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;

console.log(`Запуск приложения в режиме ${process.env.NODE_ENV} на порту ${process.env.PORT}`);

// Запуск приложения
require('./server/index.js');
