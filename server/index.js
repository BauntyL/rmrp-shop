import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import config from './config';
import logger from './logger';
import routes from './routes';
import { checkConnection } from './db';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Логирование конфигурации
logger.info('Starting server with configuration', {
  nodeEnv: process.env.NODE_ENV,
  port: config.port,
  databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
});

// Основные middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Настройка CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rmrp-shop.up.railway.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimit(config.rateLimit));

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
    logger.info('Health check started');
    
    // Проверяем подключение к базе данных
    await checkConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed', { 
      error: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: {
        message: error.message,
        code: error.code
      }
    });
  }
});

// Маршруты API
logger.info('Mounting API routes at /api');
app.use('/api', routes);

// Обслуживание статических файлов
const clientDistPath = path.join(__dirname, '../client/dist');
logger.info('Serving static files from:', clientDistPath);

// Проверяем наличие директории
if (!fs.existsSync(clientDistPath)) {
  logger.error('Client dist directory not found:', clientDistPath);
  fs.mkdirSync(clientDistPath, { recursive: true });
}

// Обслуживание статических файлов
app.use(express.static(clientDistPath, {
  index: false, // Отключаем автоматическую отдачу index.html
  maxAge: '1h' // Кэширование на 1 час
}));

// Все остальные GET-запросы отправляют index.html
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    logger.info('Serving SPA index.html for path:', req.path);
    res.sendFile(indexPath);
  } else {
    logger.error('index.html not found in:', indexPath);
    res.status(404).send('Application is not built properly. Please check the deployment logs.');
  }
});

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
app.listen(config.port, () => {
  logger.info('Server started', { 
    apiPath: '/api',
    staticPath: clientDistPath,
    port: config.port,
    timestamp: new Date().toISOString()
  });
});