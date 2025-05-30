const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./logger');
const { setupAuth } = require('./auth');
const routes = require('./routes');

const app = express();

// Основные middleware
app.use(helmet()); // Безопасные заголовки HTTP
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimit(config.rateLimit));

// Настройка сессий
app.use(session({
  store: new FileStore({
    path: './sessions',
    ttl: 86400, // 1 день
    reapInterval: 3600 // Очистка старых сессий каждый час
  }),
  secret: config.security.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: config.security.sessionCookie
}));

// Настройка паспорта
app.use(passport.initialize());
app.use(passport.session());
setupAuth(passport);

// Логирование запросов
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Маршруты API
app.use('/api', routes);

// Обработка ошибок
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started`, { port: PORT });
});