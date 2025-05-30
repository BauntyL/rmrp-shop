import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  created_at?: Date;
}

export class UserModel {
  static async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
      [user.email, hashedPassword, user.name]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

// SQL для создания таблицы users
export const createUsersTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`; 