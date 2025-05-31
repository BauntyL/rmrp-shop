import bcrypt from 'bcrypt';
import { Pool } from 'pg';

// Подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export interface User {
  id: number;
  full_name: string;
  password: string;
  role: string;
  terms_accepted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  full_name: string;
  password: string;
  role?: string;
  terms_accepted?: boolean;
}

// SQL для создания таблицы пользователей
export const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  terms_accepted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индекс для быстрого поиска по full_name
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

-- Создаем индекс для поиска по роли
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
`;

export class UserModel {
  // Найти пользователя по полному имени
  static async findByFullName(fullName: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE full_name = $1';
      const result = await pool.query(query, [fullName]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Ошибка при поиске пользователя по имени:', error);
      throw error;
    }
  }

  // Найти пользователя по ID
  static async findById(id: number): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Ошибка при поиске пользователя по ID:', error);
      throw error;
    }
  }

  // Создать нового пользователя
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Хешируем пароль
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const query = `
        INSERT INTO users (full_name, password, role, terms_accepted, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        userData.full_name,
        hashedPassword,
        userData.role || 'user',
        userData.terms_accepted || false
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0] as User;
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  // Проверить пароль
  static async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Ошибка при проверке пароля:', error);
      throw error;
    }
  }

  // Обновить пользователя
  static async updateUser(id: number, updateData: Partial<CreateUserData>): Promise<User | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      // Динамически строим запрос
      if (updateData.full_name !== undefined) {
        fields.push(`full_name = $${paramIndex++}`);
        values.push(updateData.full_name);
      }

      if (updateData.password !== undefined) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        fields.push(`password = $${paramIndex++}`);
        values.push(hashedPassword);
      }

      if (updateData.role !== undefined) {
        fields.push(`role = $${paramIndex++}`);
        values.push(updateData.role);
      }

      if (updateData.terms_accepted !== undefined) {
        fields.push(`terms_accepted = $${paramIndex++}`);
        values.push(updateData.terms_accepted);
      }

      if (fields.length === 0) {
        throw new Error('Нет данных для обновления');
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] as User : null;
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      throw error;
    }
  }

  // Получить всех пользователей (для админки)
  static async getAllUsers(): Promise<User[]> {
    try {
      const query = 'SELECT * FROM users ORDER BY created_at DESC';
      const result = await pool.query(query);
      return result.rows as User[];
    } catch (error) {
      console.error('Ошибка при получении списка пользователей:', error);
      throw error;
    }
  }

  // Удалить пользователя
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      throw error;
    }
  }

  // Проверить подключение к базе данных
  static async testConnection(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ База данных подключена успешно');
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      return false;
    }
  }
}