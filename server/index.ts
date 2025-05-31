// server/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

// Импорты для базы данных и аутентификации (раскомментируйте когда будут готовы)
// import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from './middleware/auth.js';
// import authRoutes from './routes/auth.js';
// import { checkConnection } from './config/database.js';

// const prisma = new PrismaClient();

const app = express();

// Конфигурация для Railway/Production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('Starting server with configuration:', {
  nodeEnv: process.env.NODE_ENV,
  port: PORT,
  databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
});

// Middleware безопасности
if (isProduction) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
}

// Сжатие ответов
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: isProduction ? 100 : 1000, // лимит запросов на IP
  message: 'Слишком много запросов с этого IP, попробуйте позже.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Настройка CORS
const corsOptions = {
  origin: isProduction 
    ? [
        'https://autocatalog-production.up.railway.app',
        'https://rmrp-shop.up.railway.app' // добавьте ваш актуальный домен
      ]
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware для парсинга
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Базовый healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Расширенный healthcheck endpoint
app.get('/api/health/detailed', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    // Проверяем подключение к базе данных (раскомментируйте когда будет готово)
    // const dbConnected = await checkConnection();
    const dbConnected = true; // временно
    
    res.json({
      status: dbConnected ? 'healthy' : 'database_error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbConnected ? 'connected' : 'error',
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      },
      config: {
        port: PORT,
        nodeEnv: process.env.NODE_ENV,
        corsOrigins: corsOptions.origin
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: isProduction ? 'Internal server error' : (error as Error).message
    });
  }
});

// Маршруты аутентификации (раскомментируйте когда будут готовы)
// app.use('/api/auth', authRoutes);

// Защищенные маршруты (раскомментируйте когда будут готовы)
// app.use('/api/protected', authenticateToken, (req, res) => {
//   res.json({ message: 'Доступ разрешен', user: req.user });
// });

// TODO: Добавьте ваши маршруты здесь
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);

// Статические файлы (если есть клиентская сборка)
if (isProduction) {
  app.use(express.static('client/dist'));
  
  // Catch-all для SPA
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile('index.html', { root: 'client/dist' });
  });
}

// Middleware для обработки 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method
  });
});

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Ошибка:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    error: isProduction ? 'Внутренняя ошибка сервера' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, выключаем сервер...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT получен, выключаем сервер...');
  process.exit(0);
});

// Запуск сервера
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT} в режиме ${process.env.NODE_ENV}`);
  console.log(`📡 CORS настроен для: ${Array.isArray(corsOptions.origin) ? corsOptions.origin.join(', ') : corsOptions.origin}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;