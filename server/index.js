const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const MemoryStore = require('memorystore')(session);
const bcrypt = require('bcrypt');
const { getUserByUsername } = require('../storage')
;
const { initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Обработка preflight запросов
app.options('*', cors({
  origin: 'http://rmrp-shop.ru',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// CORS
app.use(cors({
  origin: 'http://rmrp-shop.ru',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Настройка сессий
app.use(session({
  cookie: {
    maxAge: 86400000,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid'
}));

// Статические файлы
app.use(express.static(path.join(__dirname, '../build')));

// API Routes

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('=== LOGIN DEBUG ===');
  console.log('Попытка входа:', { username });

  try {
    // Загружаем пользователя из БД
    const user = await getUserByUsername(username);
    console.log('Найденный пользователь из БД:', user ? { id: user.id, username: user.username, role: user.role } : null);

    if (!user) {
      console.log('Пользователь не найден в БД!');
      return res.status(401).json({ error: 'Неверные данные' });
    }

    // Проверяем пароль
    const isValidPassword = user.password.startsWith('$2b$') 
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isValidPassword) {
      console.log('Неверный пароль!');
      return res.status(401).json({ error: 'Неверные данные' });
    }

    req.session.userId = user.id;
    req.session.user = { id: user.id, username: user.username, role: user.role };

    console.log('Сессия установлена:', req.session.user);
    console.log('===================');

    res.json({ user: req.session.user });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Выход
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при выходе' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен' });
  });
});

// Проверка статуса
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Не авторизован' });
  }
});

// Обработка всех остальных маршрутов - отдаем React приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Запуск сервера
// Инициализация базы данных
initDb();
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;
