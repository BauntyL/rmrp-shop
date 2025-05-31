import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseError extends Error {
  code?: string;
}

const getDatabaseConfig = () => {
  const defaultUrl = 'postgresql://postgres:OKVGVKtirMjvUDZUPQEBpkMAjosxhyQd@tramway.proxy.rlwy.net:41435/railway';
  
  // Используем DATABASE_URL из переменных окружения или дефолтный URL
  const connectionString = process.env.DATABASE_URL || defaultUrl;
  
  console.log('Подключение к базе данных...');
  
  return {
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Дополнительные параметры для стабильности соединения
    max: 20, // максимальное количество клиентов в пуле
    idleTimeoutMillis: 30000, // время простоя перед освобождением клиента
    connectionTimeoutMillis: 2000, // время ожидания соединения
    maxUses: 7500, // количество запросов перед пересозданием клиента
  };
};

const pool = new pg.Pool(getDatabaseConfig());

// Обработка ошибок
pool.on('error', (err: DatabaseError) => {
  console.error('Ошибка пула соединений:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Соединение с базой данных потеряно. Переподключение...');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.log('База данных имеет слишком много соединений');
  } else if (err.code === 'ECONNREFUSED') {
    console.log('В соединении с базой данных отказано');
  } else {
    console.error('Неожиданная ошибка пула:', err);
  }
});

// Мониторинг соединений
pool.on('connect', () => {
  console.log('Новое соединение с базой данных установлено');
});

pool.on('acquire', () => {
  console.log('Соединение получено из пула');
});

pool.on('remove', () => {
  console.log('Соединение удалено из пула');
});

// Функция для проверки соединения
export const checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Соединение с базой данных успешно проверено');
    return true;
  } catch (error) {
    console.error('Ошибка при проверке соединения с базой данных:', error);
    return false;
  }
};

export { pool };
export default pool;