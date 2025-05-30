import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export interface User {
  id?: number;
  full_name: string;
  password_hash: string;
  created_at?: Date;
}

export class UserModel {
  static async createUser(user: { full_name: string; password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (full_name, password_hash) VALUES ($1, $2) RETURNING *',
      [user.full_name, hashedPassword]
    );
    
    return result.rows[0];
  }

  static async findByFullName(fullName: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE full_name = $1', [fullName]);
    return result.rows[0] || null;
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }
}

// SQL для создания таблицы users
export const createUsersTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`; 