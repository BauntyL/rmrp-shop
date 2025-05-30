const bcrypt = require("bcrypt");
const { pool } = require("./db");

// Функция для хеширования пароля
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// Функция для создания пользователя
async function createUser(username, password, role) {
  const hashedPassword = await hashPassword(password);
  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
    [username, hashedPassword, role]
  );
  return result.rows[0];
}

// Функция для создания автомобиля
async function createCar(carData) {
  const {
    name,
    description,
    price,
    category,
    server,
    createdBy,
    imageUrl = 'https://via.placeholder.com/400x300?text=Car'
  } = carData;

  const result = await pool.query(
    `INSERT INTO cars (
      name, description, price, category, server, created_by, image_url, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved')
    RETURNING *`,
    [name, description, price, category, server, createdBy, imageUrl]
  );
  return result.rows[0];
}

// Основная функция инициализации базы данных
async function initDatabase() {
  console.log('🔧 Initializing database tables...');

  try {
    // Создание таблицы пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы автомобилей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        year INTEGER,
        price INTEGER NOT NULL,
        description TEXT,
        category VARCHAR(50),
        server VARCHAR(50),
        max_speed INTEGER,
        acceleration VARCHAR(10),
        drive VARCHAR(50),
        transmission VARCHAR(50),
        fuel_type VARCHAR(50),
        phone VARCHAR(20),
        telegram VARCHAR(50),
        discord VARCHAR(50),
        image_url TEXT,
        images JSONB,
        is_premium BOOLEAN DEFAULT false,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_by INTEGER REFERENCES users(id),
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Создание таблицы заявок на автомобили
    await pool.query(`
      CREATE TABLE IF NOT EXISTS car_applications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        server VARCHAR(100) NOT NULL,
        "createdBy" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "imageUrl" TEXT DEFAULT 'https://via.placeholder.com/400x300?text=Car',
        status VARCHAR(50) DEFAULT 'pending',
        "reviewedBy" INTEGER REFERENCES users(id),
        "reviewedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы избранного
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "carId" INTEGER REFERENCES cars(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "carId")
      )
    `);

    // Создание таблицы сообщений
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        "senderId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "carId" INTEGER REFERENCES cars(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "isRead" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создание таблицы сессий
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);

    // Создание таблицы уведомлений
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        read_at TIMESTAMP
      )
    `);

    // Создание индексов
    await pool.query(`
      CREATE INDEX IF NOT EXISTS cars_status_idx ON cars(status);
      CREATE INDEX IF NOT EXISTS cars_created_by_idx ON cars(created_by);
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
    `);

    console.log('✅ Database tables initialized');

    // Проверяем, существуют ли админы
    const adminCheck = await pool.query(
      'SELECT * FROM users WHERE role = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      console.log('🌱 Creating admin accounts...');

      // Создаем административные аккаунты
      const admin1 = await createUser('477-554', 'lql477kqkvb55vp', 'admin');
      const admin2 = await createUser('Баунти Миллер', 'Lqlcpyvb555!999#81', 'admin');

      console.log(`👤 Admin 1: ${admin1.username} (ID: ${admin1.id})`);
      console.log(`👤 Admin 2: ${admin2.username} (ID: ${admin2.id})`);
      console.log('👤 Admin 477-554: lql477kqkvb55vp');
      console.log('👤 Admin Баунти Миллер: Lqlcpyvb555!999#81');
    } else {
      console.log(`✅ Found ${adminCheck.rows.length} existing admin(s)`);
      console.log('👤 Admin 477-554: lql477kqkvb55vp');
      console.log('👤 Admin Баунти Миллер: Lqlcpyvb555!999#81');
    }

    // Проверяем количество автомобилей
    const carCheck = await pool.query('SELECT COUNT(*) FROM cars');
    const carCount = parseInt(carCheck.rows[0].count);

    if (carCount === 0) {
      console.log('🚗 Creating sample cars...');

      // Создаем тестовые автомобили
      const sampleCars = [
        {
          name: 'BMW X5 M50i',
          description: 'Мощный и роскошный внедорожник с V8 двигателем. Отличное состояние, полная комплектация.',
          price: 4500000,
          category: 'Внедорожники',
          server: 'Grand RP',
          createdBy: adminCheck.rows[0]?.id || 1,
          imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Mercedes-Benz G63 AMG',
          description: 'Легендарный Гелендваген с мощным AMG двигателем. Статусный автомобиль для настоящих ценителей.',
          price: 6800000,
          category: 'Внедорожники',
          server: 'Arizona RP',
          createdBy: adminCheck.rows[0]?.id || 1,
          imageUrl: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Lamborghini Huracán',
          description: 'Спортивный суперкар с невероятной динамикой. V10 двигатель, полный привод, карбоновые элементы.',
          price: 8900000,
          category: 'Спорткары',
          server: 'Radmir RP',
          createdBy: adminCheck.rows[0]?.id || 1,
          imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Audi RS6 Avant',
          description: 'Универсал с душой спорткара. Quattro полный привод, twin-turbo V8, практичность и скорость.',
          price: 3200000,
          category: 'Универсалы',
          server: 'Grand RP',
          createdBy: adminCheck.rows[0]?.id || 1,
          imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          name: 'Tesla Model S Plaid',
          description: 'Электрический седан с рекордной динамикой. Автопилот, огромный запас хода, футуристичный интерьер.',
          price: 2800000,
          category: 'Электромобили',
          server: 'Arizona RP',
          createdBy: adminCheck.rows[0]?.id || 1,
          imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ];

      for (const carData of sampleCars) {
        const car = await createCar(carData);
        console.log(`🚗 Created car: ${car.name} (ID: ${car.id})`);
      }

      console.log(`✅ Created ${sampleCars.length} sample cars`);
    } else {
      console.log(`✅ Found ${carCount} existing cars in database`);
    }

    console.log('🎉 Database initialization completed successfully');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Запускаем инициализацию если файл запущен напрямую
if (require.main === module) {
  initDatabase().catch(console.error);
}

module.exports = {
  initDatabase,
  createUser,
  createCar
};
