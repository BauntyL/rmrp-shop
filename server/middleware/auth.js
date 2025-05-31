import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.js';

// Расширяем тип Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        fullName: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

// Генерация JWT токена
export function generateToken(userId: number): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret-key';
  
  if (!secret || secret === 'fallback-secret-key') {
    console.warn('⚠️  JWT_SECRET не установлен, используется fallback ключ');
  }

  return jwt.sign(
    { userId },
    secret,
    { 
      expiresIn: '7d', // Токен действует 7 дней
      issuer: 'rmrp-shop',
      audience: 'rmrp-shop-users'
    }
  );
}

// Проверка JWT токена (middleware)
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен доступа не предоставлен'
      });
    }

    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Проверяем существование пользователя
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Добавляем пользователя в запрос
    req.user = {
      id: user.id,
      fullName: user.full_name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Токен истек'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Ошибка при проверке токена'
    });
  }
}

// Проверка роли пользователя
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав доступа'
      });
    }

    next();
  };
}

// Проверка что пользователь - админ
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}

// Опциональная аутентификация (не требует токен, но если есть - проверяет)
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Продолжаем без пользователя
    }

    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await UserModel.findById(decoded.userId);
    if (user) {
      req.user = {
        id: user.id,
        fullName: user.full_name,
        role: user.role
      };
    }

    next();
  } catch (error) {
    // Игнорируем ошибки при опциональной аутентификации
    next();
  }
}

// Проверка что пользователь может редактировать ресурс (владелец или админ)
export function requireOwnershipOrAdmin(getUserId: (req: Request) => number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const resourceUserId = getUserId(req);
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Недостаточно прав доступа'
    });
  };
}