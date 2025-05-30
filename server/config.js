const config = {
  security: {
    bcryptRounds: 10,
    sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    sessionCookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  validation: {
    username: {
      minLength: 3,
      maxLength: 30
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

module.exports = config; 