const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function resetPassword() {
  const pool = new Pool({
    connectionString: 'postgresql://admin:3dUJDvpcxPQLmQaIRoSvBJiCAX4in8Sz@dpg-d0pltgumcj7s73ea81m0-a.oregon-postgres.render.com/trading_platform_k7up',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'Баунти Миллер' RETURNING username, role",
      [hashedPassword]
    );
    
    console.log('✅ Пароль обновлен для:', result.rows[0]);
    console.log('🔑 Новый пароль:', newPassword);
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
