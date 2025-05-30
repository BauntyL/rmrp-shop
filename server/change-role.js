const { Client } = require('pg');
require('dotenv').config();

async function listUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔍 Список всех пользователей:');
    
    const result = await client.query('SELECT id, username, role, "createdAt" FROM users ORDER BY id');
    
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error);
  } finally {
    await client.end();
  }
}

async function changeUserRole(identifier, newRole) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    let query, params;
    
    // Проверяем, число ли это (ID) или строка (username)
    if (!isNaN(identifier)) {
      query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING *';
      params = [newRole, parseInt(identifier)];
      console.log(`🔄 Изменяем роль пользователя с ID ${identifier} на "${newRole}"`);
    } else {
      query = 'UPDATE users SET role = $1 WHERE username = $2 RETURNING *';
      params = [newRole, identifier];
      console.log(`🔄 Изменяем роль пользователя "${identifier}" на "${newRole}"`);
    }
    
    const result = await client.query(query, params);
    
    if (result.rows.length > 0) {
      console.log('✅ Роль успешно изменена:');
      console.table(result.rows);
    } else {
      console.log('❌ Пользователь не найден');
    }
    
  } catch (error) {
    console.error('❌ Ошибка изменения роли:', error);
  } finally {
    await client.end();
  }
}

// Получаем аргументы командной строки
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📋 Использование:

Посмотреть всех пользователей:
node change-role.js list

Изменить роль по ID:
node change-role.js 2 admin

Изменить роль по имени пользователя:
node change-role.js "имя_пользователя" admin

Доступные роли: user, admin
  `);
} else if (args[0] === 'list') {
  listUsers();
} else if (args.length === 2) {
  const [identifier, role] = args;
  if (!['user', 'admin'].includes(role)) {
    console.log('❌ Доступные роли: user, admin');
  } else {
    changeUserRole(identifier, role);
  }
} else {
  console.log('❌ Неверные аргументы. Используй: node change-role.js list или node change-role.js <id/username> <role>');
}
