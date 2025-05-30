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

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? ['https://autocatalog-production.up.railway.app', 'https://rmrp-shop.ru']
  : ['http://localhost:5173'];

// CORS настройки
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  proxy: true, // Доверяем прокси (Railway)
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS в production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' 
      ? '.up.railway.app'  // Домен для Railway
      : undefined
  }
}));

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  console.log('🍪 Session ID:', req.sessionID);
  console.log('👤 User:', req.session?.user?.username);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Инициализация аутентификации
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

// Инициализация базы данных и запуск сервера
async function startServer() {
  try {
    console.log('🚀 Starting server...');
    
    console.log('🔄 Connecting to database...');
    await initDb();
    console.log('✅ Database connected and initialized!');
    
    app.listen(port, () => {
      console.log(`🌟 Server is running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();