import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const getDatabaseConfig = () => {
  // Если есть DATABASE_URL (предоставляется Railway), используем его
  if (process.env.DATABASE_URL) {
    console.log('Используем DATABASE_URL для подключения к БД');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  // Иначе используем отдельные параметры подключения
  const config = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'rmrp_shop',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };

  console.log('Настройки подключения к БД:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: !!config.ssl
  });

  return config;
};

const pool = new pg.Pool(getDatabaseConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Successfully connected to database');
});

export default pool; 