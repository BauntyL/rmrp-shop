import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import compression from 'compression';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();

// Поддержка JSON в теле запроса
app.use(express.json());

// Включаем сжатие для всех ответов
app.use(compression());

// Настройка CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Подключаем маршруты аутентификации
app.use('/api/auth', authRoutes);

// Маршрут для healthcheck (Railway)
app.get('/api/health', (req, res) => res.status(200).send('ok'));

// Обслуживание статических файлов из папки dist
app.use(express.static(path.join(rootDir, 'client/dist'), {
  maxAge: '1y',
  etag: true,
}));

// Все остальные GET-запросы перенаправляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 