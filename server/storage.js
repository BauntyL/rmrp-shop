const { pool } = require('./db');

// Функции для работы с карточками автомобилей
async function createCarListing(carData) {
  const {
    name,
    brand,
    model,
    year,
    price,
    description,
    category,
    server,
    max_speed,
    acceleration,
    drive,
    transmission,
    fuel_type,
    phone,
    telegram,
    discord,
    image_url,
    images,
    is_premium,
    created_by,
    status = 'pending'
  } = carData;
  
  const result = await pool.query(
    `INSERT INTO cars (
      name, brand, model, year, price, description,
      category, server, max_speed, acceleration, drive,
      transmission, fuel_type, phone, telegram, discord,
      image_url, images, is_premium, created_by, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    ) RETURNING *`,
    [
      name, brand, model, year, price, description,
      category, server, max_speed, acceleration, drive,
      transmission, fuel_type, phone, telegram, discord,
      image_url, JSON.stringify(images), is_premium, created_by, status
    ]
  );

  return result.rows[0];
}

async function getPendingCarListings() {
  const result = await pool.query(
    `SELECT c.*, u.username as owner_name
     FROM cars c
     JOIN users u ON c.created_by = u.id
     WHERE c.status = 'pending'
     ORDER BY c.created_at DESC`
  );

  return result.rows;
}

async function updateCarListingStatus(carId, status, reviewerId) {
  const result = await pool.query(
    `UPDATE cars
     SET status = $1, 
         reviewed_by = $2,
         reviewed_at = NOW(),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, reviewerId, carId]
  );

  return result;
}

async function getApprovedCarListings(limit, offset, sortQuery) {
  const result = await pool.query(
    `SELECT c.*, u.username as owner_name
     FROM cars c
     JOIN users u ON c.created_by = u.id
     WHERE c.status = 'approved'
     ${sortQuery}
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result;
}

async function getApprovedCarListingsCount() {
  return await pool.query(
    `SELECT COUNT(*) FROM cars WHERE status = 'approved'`
  );
}

async function createNotification(notificationData) {
  const { user_id, title, message, type } = notificationData;
  
  const result = await db.query(
    `INSERT INTO notifications (user_id, title, message, type, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [user_id, title, message, type]
  );

  return result.rows[0];
}

// Экспортируем новые функции
module.exports = {
  // ... existing exports ...
  createCarListing,
  getPendingCarListings,
  updateCarListingStatus,
  getApprovedCarListings,
  getApprovedCarListingsCount,
  createNotification
}; 