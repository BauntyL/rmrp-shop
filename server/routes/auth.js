import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { validatePasswordMiddleware } from '../auth';
import storage from '../storage';
import config from '../config';
import logger from '../logger';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({ error: 'Full name and password are required' });
    }

    const user = await UserModel.findByFullName(fullName);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { fullName, password } = req.body;
    
    if (!fullName || !password) {
      return res.status(400).json({ error: 'Full name and password are required' });
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length !== 2) {
      return res.status(400).json({ error: 'Full name must be in format "First Last"' });
    }

    const existingUser = await UserModel.findByFullName(fullName);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create(fullName, hashedPassword);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

export default router; 