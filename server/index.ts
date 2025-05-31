import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import compression from 'compression';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();

// Логирование для отладки
console.log('🔧 Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', PORT);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');
console.log('- SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');

// Поддержка JSON в теле запроса
app.use(express.json());

// Включаем сжатие для всех ответов
app.use(compression());

// Настройка CORS с учетом Railway
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'https://*.railway.app',
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.some(allowed => 
    allowed === '*' || origin === allowed || origin.includes('railway.app')
  )) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Подключаем маршруты аутентификации
app.use('/api/auth', authRoutes);

// Маршрут для healthcheck (Railway)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  });
});

// Обслуживание статических файлов из папки dist
app.use(express.static(path.join(rootDir, 'client/dist'), {
  maxAge: '1y',
  etag: true,
}));

// Все остальные GET-запросы перенаправляем на index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'client/dist/index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});