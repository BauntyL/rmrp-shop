import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { validatePasswordMiddleware } from '../auth';
import storage from '../storage';
import config from '../config';
import logger from '../logger';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Вспомогательная функция для создания JWT токена
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      fullName: user.fullName,
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    { expiresIn: '7d' }
  );
};

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { fullName, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findFirst({
      where: { fullName }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким именем уже существует'
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        fullName,
        password: hashedPassword,
        role: 'user'
      }
    });

    // Генерируем токен
    const token = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации пользователя'
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { fullName, password } = req.body;

    // Ищем пользователя
    const user = await prisma.user.findFirst({
      where: { fullName }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Неверное имя пользователя или пароль'
      });
    }

    // Генерируем токен
    const token = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при входе в систему'
    });
  }
});

// Проверка текущего пользователя
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }
});

// Выход
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Выход выполнен успешно'
  });
});

export default router; 