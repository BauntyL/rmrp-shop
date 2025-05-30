const { Pool } = require('pg');

async function makeAdmin() {
  // Используем точную строку подключения
  const pool = new Pool({
    connectionString: 'postgresql://admin:3dUJDvpcxPQLmQaIRoSvBJiCAX4in8Sz@dpg-d0pltgumcj7s73ea81m0-a.oregon-postgres.render.com/trading_platform_k7up',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Подключение к базе...');
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE username = 'Баунти Миллер' RETURNING *"
    );
    console.log('Результат:', result.rows);
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

makeAdmin();
