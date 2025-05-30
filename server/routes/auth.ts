import express from 'express';
import { UserModel } from '../models/user.js';
import { generateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

interface JwtPayload {
  userId: number;
}

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать полное имя и пароль'
      });
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Полное имя должно быть в формате "Имя Фамилия"'
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await UserModel.findByFullName(fullName);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким именем уже существует'
      });
    }

    // Создаем нового пользователя
    const user = await UserModel.createUser({ full_name: fullName, password });
    
    // Создаем JWT токен
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации пользователя',
      error: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { fullName, password } = req.body;
    
    console.log('Попытка входа для:', fullName);

    if (!fullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать полное имя и пароль'
      });
    }

    // Ищем пользователя
    try {
      const user = await UserModel.findByFullName(fullName);
      console.log('Результат поиска пользователя:', user ? 'найден' : 'не найден');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверное имя или пароль'
        });
      }

      // Проверяем пароль
      try {
        const isValidPassword = await UserModel.validatePassword(user, password);
        console.log('Результат проверки пароля:', isValidPassword);
        
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Неверное имя или пароль'
          });
        }

        // Создаем JWT токен
        const token = generateToken(user.id);

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            fullName: user.full_name
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as JwtPayload;
    const user = await UserModel.findById(decoded.userId);

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
        fullName: user.full_name
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

export default router; 