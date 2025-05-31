// server/index.js или аналогичный главный файл сервера

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware/auth.js';
import { checkConnection } from './config/database.js';

const app = express();
const prisma = new PrismaClient();

// Конфигурация для Railway
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3001;

// Настройка CORS для Railway
const corsOptions = {
  origin: isProduction 
    ? ['https://autocatalog-production.up.railway.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    const dbConnected = await checkConnection();
    
    res.json({
      status: dbConnected ? 'healthy' : 'database_error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbConnected ? 'connected' : 'error'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: isProduction ? 'Internal server error' : error.message
    });
  }
});

// Маршруты аутентификации
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);

// Защищенные маршруты
app.use('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Доступ разрешен', user: req.user });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(err.status || 500).json({
    error: isProduction ? 'Внутренняя ошибка сервера' : err.message
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT} в режиме ${process.env.NODE_ENV}`);
  console.log(`CORS настроен для: ${corsOptions.origin}`);
});

export default app;