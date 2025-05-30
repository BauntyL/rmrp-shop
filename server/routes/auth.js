const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { validatePasswordMiddleware } = require('../auth');
const storage = require('../storage');
const config = require('../config');
const logger = require('../logger');

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      logger.error('Login error', { error: err.message });
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        logger.error('Session error', { error: err.message });
        return res.status(500).json({ error: 'Session error' });
      }
      
      logger.info('User logged in', { username: user.username });
      res.json({ user });
    });
  })(req, res, next);
});

router.post('/register', validatePasswordMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Валидация имени пользователя
    if (username.length < config.validation.username.minLength || 
        username.length > config.validation.username.maxLength) {
      return res.status(400).json({ 
        error: 'Invalid username length',
        details: config.validation.username
      });
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);
    
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      role: 'user'
    });
    
    logger.info('User registered', { username });
    
    // Автоматический вход после регистрации
    req.logIn(user, (err) => {
      if (err) {
        logger.error('Auto-login error', { error: err.message });
        return res.status(500).json({ error: 'Session error' });
      }
      res.status(201).json({ user });
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/logout', (req, res) => {
  const username = req.user?.username;
  req.logout((err) => {
    if (err) {
      logger.error('Logout error', { error: err.message });
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error', { error: err.message });
        return res.status(500).json({ error: 'Session error' });
      }
      
      logger.info('User logged out', { username });
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    logger.debug('User session info requested', { userId: req.user.id });
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router; 