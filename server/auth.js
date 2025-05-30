const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const storage = require('./storage');  // Используем основной модуль storage
const config = require('./config');
const logger = require('./logger');
const { validatePassword } = require('./utils');

function setupAuth(passport) {
  passport.use(new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        logger.debug('Authentication attempt', { username });
        
        const user = await storage.getUserByUsername(username);
        
        // Используем одинаковое сообщение об ошибке для безопасности
        const genericError = { message: 'Неверные учетные данные' };
        
        if (!user) {
          logger.debug('Authentication failed - user not found', { username });
          return done(null, false, genericError);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          logger.debug('Authentication failed - invalid password', { username });
          return done(null, false, genericError);
        }

        // Удаляем чувствительные данные перед отправкой
        const sanitizedUser = {
          id: user.id,
          username: user.username,
          role: user.role
        };

        logger.info('Authentication successful', { username });
        return done(null, sanitizedUser);
      } catch (error) {
        logger.error('Authentication error', { error: error.message });
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    logger.debug('Serializing user', { userId: user.id });
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      logger.debug('Deserializing user', { userId: id });
      const user = await storage.getUserById(id);
      
      if (!user) {
        logger.warn('User not found during deserialization', { userId: id });
        return done(null, false);
      }

      // Удаляем чувствительные данные
      const sanitizedUser = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      done(null, sanitizedUser);
    } catch (error) {
      logger.error('Deserialization error', { error: error.message });
      done(error);
    }
  });
}

// Middleware для проверки сильного пароля
const validatePasswordMiddleware = (req, res, next) => {
  const { password } = req.body;
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Invalid password',
      details: validation.errors
    });
  }
  
  next();
};

module.exports = {
  setupAuth,
  validatePasswordMiddleware
};
