const { pool, initDb } = require('./db');

async function checkDatabase() {
  try {
    console.log('🔄 Checking database connection...');
    
    // Проверяем подключение
    await initDb();
    
    // Проверяем существующие таблицы
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📊 Existing tables:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkDatabase();
} 