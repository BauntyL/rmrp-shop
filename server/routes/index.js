const express = require('express');
const authRoutes = require('./auth');
const applicationRoutes = require('./applications');
const userRoutes = require('./users');
const adminRoutes = require('./admin');
const { checkConnection } = require('../db');
const logger = require('../logger');

const router = express.Router();

// Проверка здоровья системы
router.get('/health', async (req, res) => {
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

// Маршруты аутентификации
router.use('/auth', authRoutes);

// Маршруты заявок
router.use('/applications', applicationRoutes);

// Маршруты пользователей
router.use('/users', userRoutes);

// Административные маршруты
router.use('/admin', adminRoutes);

module.exports = router; 