import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Используем SESSION_SECRET как JWT_SECRET для совместимости
const JWT_SECRET = process.env.SESSION_SECRET || 'gHFh_QOGYrQzCpC81HjBVxPyk0NbpyYG';

export const authenticateToken = async (req, res, next) => {
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

    req.user = {
      id: user.id,
      fullName: user.fullName,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}; 