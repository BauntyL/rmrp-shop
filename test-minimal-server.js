import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const app = express();

// Добавляем CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Добавляем обработку ошибок JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway",
  ssl: {
    rejectUnauthorized: false
  }
});

// Проверяем подключение к базе данных при старте
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to database');
    release();
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { fullName, password } = req.body;
    
    if (!fullName || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Full name and password are required' });
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length !== 2) {
      console.log('Invalid name format');
      return res.status(400).json({ error: 'Full name must be in format "First Last"' });
    }

    const userExists = await pool.query(
      'SELECT * FROM users WHERE full_name = $1',
      [fullName]
    );

    if (userExists.rows.length > 0) {
      console.log('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (full_name, password_hash) VALUES ($1, $2) RETURNING id, full_name',
      [fullName, hashedPassword]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    console.log('User registered successfully:', result.rows[0]);
    res.json({
      user: result.rows[0],
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Full name and password are required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE full_name = $1',
      [fullName]
    );

    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    console.log('User logged in successfully:', { id: user.id, fullName: user.full_name });
    res.json({
      user: {
        id: user.id,
        fullName: user.full_name
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 