const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const setupAuth = require('./auth');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./db');

// Загружаем переменные окружения из .env файла в корневой папке
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { initDb } = require("./db");
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий с использованием PostgreSQL
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());
setupAuth(passport);

// Статические файлы из папки client/dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// API роуты
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Подключаем все API роуты
app.use('/api', routes);

// Fallback для React Router - должен быть ПОСЛЕДНИМ
app.get('*', (req, res) => {
  // Проверяем, что это не API запрос
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Отправляем index.html из папки client/dist
  res.sendFile(path.join(__dirname, '../client/dist/index.html'), (err) => {
    if (err) {
      console.log('Error serving index.html:', err);
      res.status(500).send('Error loading page');
    }
  });
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