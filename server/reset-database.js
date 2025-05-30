const { pool } = require('./db');
const { initDatabase } = require('./init-database');

async function resetDatabase() {
  try {
    console.log('🗑️ Dropping existing tables...');
    
    await pool.query(`
      DROP TABLE IF EXISTS 
        notifications,
        messages,
        favorites,
        cars,
        car_applications,
        session,
        users
      CASCADE
    `);

    console.log('✅ Tables dropped successfully');
    
    console.log('🔄 Reinitializing database...');
    await initDatabase();
    
    console.log('🎉 Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetDatabase();
} 