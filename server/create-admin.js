import bcrypt from 'bcrypt';
import { getClient } from './db.js';

async function createAdminAccount() {
  try {
    const username = 'Баунти Миллер';
    const password = 'Lqlcpyvb555!999#81';
    const client = getClient();

    // Проверяем, существует ли уже такой пользователь
    const existingUserResult = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const existingUser = existingUserResult.rows[0];

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('✅ Admin account already exists');
        return;
      }
      // Обновляем роль существующего пользователя до админа
      await client.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['admin', existingUser.id]
      );
      console.log('✅ Existing user upgraded to admin');
      return;
    }

    // Создаем нового админа
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, 'admin']
    );
    const user = result.rows[0];

    console.log('✅ Admin account created successfully');
    console.log('Username:', username);
    console.log('Role:', user.role);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  }
}

// Запускаем создание админа
createAdminAccount(); 