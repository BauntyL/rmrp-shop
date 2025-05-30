const express = require('express');
const authRoutes = require('./auth');
const applicationRoutes = require('./applications');
const userRoutes = require('./users');
const adminRoutes = require('./admin');

const router = express.Router();

// Маршруты аутентификации
router.use('/auth', authRoutes);

// Маршруты заявок
router.use('/applications', applicationRoutes);

// Маршруты пользователей
router.use('/users', userRoutes);

// Административные маршруты
router.use('/admin', adminRoutes);

// Проверка здоровья системы
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router; 