const { Client } = require('pg');

let client;

async function initDb() {
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('🔄 Connecting to database...');
    
    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Database connected successfully');

    // Initialize tables
    await initializeTables();

    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function initializeTables() {
  try {
    console.log("🔧 Initializing database tables...");
    
    // СОЗДАЕМ ТАБЛИЦУ ПОЛЬЗОВАТЕЛЕЙ
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ✅ НЕ ПЕРЕСОЗДАЕМ! ТОЛЬКО СОЗДАЕМ ЕСЛИ НЕ СУЩЕСТВУЕТ
    await client.query(`
      CREATE TABLE IF NOT EXISTS car_applications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        category VARCHAR(100),
        server VARCHAR(100),
        "maxSpeed" INTEGER,
        acceleration VARCHAR(50),
        drive VARCHAR(50),
        "serverId" VARCHAR(100),
        phone VARCHAR(50),
        telegram VARCHAR(100),
        discord VARCHAR(100),
        "imageUrl" TEXT,
        "isPremium" BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'pending',
        "createdBy" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "reviewedBy" INTEGER REFERENCES users(id),
        "reviewedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ✅ НЕ ПЕРЕСОЗДАЕМ! ТОЛЬКО СОЗДАЕМ ЕСЛИ НЕ СУЩЕСТВУЕТ
    await client.query(`
      CREATE TABLE IF NOT EXISTS car_listings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        category VARCHAR(100),
        server VARCHAR(100),
        "maxSpeed" INTEGER,
        acceleration VARCHAR(50),
        drive VARCHAR(50),
        "isPremium" BOOLEAN DEFAULT FALSE,
        phone VARCHAR(50),
        telegram VARCHAR(100),
        discord VARCHAR(100),
        "imageUrl" TEXT,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        application_id INTEGER REFERENCES car_applications(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ✅ НЕ ПЕРЕСОЗДАЕМ! ТОЛЬКО СОЗДАЕМ ЕСЛИ НЕ СУЩЕСТВУЕТ
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        "senderId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "receiverId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "carId" INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "isRead" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ✅ НЕ ПЕРЕСОЗДАЕМ! ТОЛЬКО СОЗДАЕМ ЕСЛИ НЕ СУЩЕСТВУЕТ
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "carId" INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "carId")
      )
    `);

    console.log("✅ Database tables initialized successfully (preserved existing data)");
    
    // СОЗДАЕМ АДМИНА ЕСЛИ НЕТ
    await createDefaultAdmin();
    
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

async function createDefaultAdmin() {
  try {
    const adminCheck = await client.query(
      'SELECT * FROM users WHERE role = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      console.log('🌱 Creating default admin...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Lqlcpyvb555!999#81', 10);
      
      await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['Баунти Миллер', hashedPassword, 'admin']
      );
      
      console.log('✅ Default admin created: Баунти Миллер / Lqlcpyvb555!999#81');
    } else {
      console.log('✅ Admin exists:', adminCheck.rows[0].username);
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

function getClient() {
  if (!client) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return client;
}

module.exports = {
  initDb,
  getClient
};
