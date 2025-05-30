const path = require('path');
const express = require('express');
const cors = require('cors');

// Загружаем переменные окружения из .env файла в корневой папке
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { initDb } = require("./db");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (если есть)
app.use(express.static(path.join(__dirname, '../dist')));

// Базовый роут для проверки
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Запуск приложения
(async () => {
  try {
    console.log('🚀 Starting server...');
    
    // Инициализация базы данных
    await initDb();
    console.log('✅ Database connected and initialized!');
    
    // Запуск сервера
    app.listen(port, () => {
      console.log(`🌟 Server is running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize the server:', error);
    process.exit(1);
  }
})();