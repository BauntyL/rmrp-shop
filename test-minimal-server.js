import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const app = express();
app.use(express.json());

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway"
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, password } = req.body;
    console.log('Registration attempt:', { fullName });
    
    if (!fullName || !password) {
      return res.status(400).json({ error: 'Full name and password are required' });
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length !== 2) {
      return res.status(400).json({ error: 'Full name must be in format "First Last"' });
    }

    const userExists = await pool.query(
      'SELECT * FROM users WHERE full_name = $1',
      [fullName]
    );

    if (userExists.rows.length > 0) {
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
      'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: result.rows[0],
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { fullName, password } = req.body;
    console.log('Login attempt:', { fullName });

    if (!fullName || !password) {
      return res.status(400).json({ error: 'Full name and password are required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE full_name = $1',
      [fullName]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      'your-super-secret-jwt-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
}); 