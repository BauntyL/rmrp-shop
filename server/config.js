require('dotenv').config();

module.exports = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway',
    ssl: {
      rejectUnauthorized: false
    }
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://rmrp-shop.up.railway.app' : 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // 100 запросов с одного IP
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
    sessionCookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 часа
    },
    bcryptRounds: 10
  },
  validation: {
    username: {
      minLength: 3,
      maxLength: 50
    },
    password: {
      minLength: 8,
      maxLength: 100
    }
  },
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
}; 