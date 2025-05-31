require('dotenv').config();

const config = {
  port: process.env.PORT || 3003,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
    credentials: true
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
};

module.exports = config;