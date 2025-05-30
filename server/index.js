const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./logger');
const { setupAuth } = require('./auth');
const routes = require('./routes');
const { pool, checkConnection } = require('./db');

const app = express();

// Логирование конфигурации
logger.info('Starting server with configuration', {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
});

// Основные middleware
app.use(helmet()); // Безопасные заголовки HTTP
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimit(config.rateLimit));

// Настройка сессий в PostgreSQL
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true
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

// Логирование всех запросов
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    ip: req.ip,
    headers: req.headers
  });
  next();
});

// Проверка здоровья системы
app.get('/api/health', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    await checkConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Маршруты API
logger.info('Mounting API routes at /api');
app.use('/api', routes);

// Обработка ошибок
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
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
  logger.info(`Server started`, { 
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    apiPath: '/api'
  });
});