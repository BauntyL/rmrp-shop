import express from 'express';
import { UserModel } from '../models/user.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Создаем нового пользователя
    const user = await UserModel.createUser({ email, password, name });
    
    // Создаем JWT токен
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
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
    const { email, password } = req.body;
    
    console.log('Попытка входа для:', email);

    // Ищем пользователя
    try {
      const user = await UserModel.findByEmail(email);
      console.log('Результат поиска пользователя:', user ? 'найден' : 'не найден');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль'
        });
      }

      // Проверяем пароль
      try {
        const isValidPassword = await UserModel.validatePassword(user, password);
        console.log('Результат проверки пароля:', isValidPassword);
        
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Неверный email или пароль'
          });
        }

        // Создаем JWT токен
        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        });
      } catch (passwordError) {
        console.error('Ошибка при проверке пароля:', passwordError);
        throw passwordError;
      }
    } catch (dbError) {
      console.error('Ошибка при поиске пользователя в БД:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Общая ошибка при входе:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при попытке входа',
      error: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    });
  }
});

export default router; 