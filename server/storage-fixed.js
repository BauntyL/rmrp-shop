const { pool } = require('./db');

// Заявки на автомобили
async function createApplication(applicationData) {
  try {
    const {
      name,
      description,
      price,
      category,
      server,
      createdBy,
      imageUrl = 'https://via.placeholder.com/400x300?text=Car'
    } = applicationData;

    const result = await pool.query(`
      INSERT INTO car_applications (
        name, description, price, category, server, "createdBy", "imageUrl"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, description, price, category, server, createdBy, imageUrl]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating application:', error);
    throw error;
  }
}

async function getApplications() {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.username as "createdByUsername",
        ru.username as "reviewedByUsername"
      FROM car_applications a
      LEFT JOIN users u ON a."createdBy" = u.id
      LEFT JOIN users ru ON a."reviewedBy" = ru.id
      ORDER BY a."createdAt" DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting applications:', error);
    throw error;
  }
}

async function getUserApplications(userId) {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.username as "createdByUsername",
        ru.username as "reviewedByUsername"
      FROM car_applications a
      LEFT JOIN users u ON a."createdBy" = u.id
      LEFT JOIN users ru ON a."reviewedBy" = ru.id
      WHERE a."createdBy" = $1
      ORDER BY a."createdAt" DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting user applications:', error);
    throw error;
  }
}

// Объявления автомобилей
async function createCarListing(carData) {
  try {
    const {
      name,
      description,
      price,
      category,
      server,
      maxSpeed,
      acceleration,
      drive,
      isPremium,
      phone,
      telegram,
      discord,
      imageUrl,
      owner_id,
      application_id
    } = carData;

    const result = await pool.query(`
      INSERT INTO cars (
        name, description, price, category, server,
        "maxSpeed", acceleration, drive, "isPremium",
        phone, telegram, discord, "imageUrl",
        "createdBy", application_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15
      )
      RETURNING *
    `, [
      name, description, price, category, server,
      maxSpeed, acceleration, drive, isPremium,
      phone, telegram, discord, imageUrl,
      owner_id, application_id
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating car listing:', error);
    throw error;
  }
}

async function getCarListings() {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.username as "ownerUsername"
      FROM cars c
      LEFT JOIN users u ON c."createdBy" = u.id
      ORDER BY c."createdAt" DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting car listings:', error);
    throw error;
  }
}

async function getUserCarListings(userId) {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.username as "ownerUsername"
      FROM cars c
      LEFT JOIN users u ON c."createdBy" = u.id
      WHERE c."createdBy" = $1
      ORDER BY c."createdAt" DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting user car listings:', error);
    throw error;
  }
}

async function getCarListingById(id) {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.username as "ownerUsername"
      FROM cars c
      LEFT JOIN users u ON c."createdBy" = u.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error getting car by id:', error);
    throw error;
  }
}

// Сообщения
async function createMessage(messageData) {
  try {
    const { senderId, receiverId, carId, content } = messageData;

    const result = await pool.query(`
      INSERT INTO messages ("senderId", "receiverId", "carId", content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [senderId, receiverId, carId, content]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating message:', error);
    throw error;
  }
}

async function getMessages(userId) {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        sender.username as "senderUsername",
        receiver.username as "receiverUsername",
        c.name as "carName"
      FROM messages m
      LEFT JOIN users sender ON m."senderId" = sender.id
      LEFT JOIN users receiver ON m."receiverId" = receiver.id
      LEFT JOIN cars c ON m."carId" = c.id
      WHERE m."senderId" = $1 OR m."receiverId" = $1
      ORDER BY m."createdAt" DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    throw error;
  }
}

async function getAllMessages() {
  try {
    const result = await pool.query(`
      SELECT 
        m.*,
        sender.username as "senderUsername",
        receiver.username as "receiverUsername",
        c.name as "carName"
      FROM messages m
      LEFT JOIN users sender ON m."senderId" = sender.id
      LEFT JOIN users receiver ON m."receiverId" = receiver.id
      LEFT JOIN cars c ON m."carId" = c.id
      ORDER BY m."createdAt" DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting all messages:', error);
    throw error;
  }
}

async function markMessageAsRead(messageId, userId) {
  try {
    const result = await pool.query(`
      UPDATE messages
      SET "isRead" = true
      WHERE id = $1 AND "receiverId" = $2
      RETURNING *
    `, [messageId, userId]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    throw error;
  }
}

async function deleteMessage(messageId) {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
    return true;
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error;
  }
}

async function getUnreadMessageCount(userId) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE "receiverId" = $1 AND "isRead" = false
    `, [userId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('❌ Error getting unread message count:', error);
    throw error;
  }
}

// Избранное
async function getUserFavorites(userId) {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.username as "ownerUsername"
      FROM favorites f
      JOIN cars c ON f."carId" = c.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE f."userId" = $1
      ORDER BY f."createdAt" DESC
    `, [userId]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting user favorites:', error);
    throw error;
  }
}

async function addToFavorites(userId, carId) {
  try {
    const result = await pool.query(`
      INSERT INTO favorites ("userId", "carId")
      VALUES ($1, $2)
      RETURNING *
    `, [userId, carId]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    throw error;
  }
}

async function removeFromFavorites(userId, carId) {
  try {
    await pool.query(`
      DELETE FROM favorites
      WHERE "userId" = $1 AND "carId" = $2
    `, [userId, carId]);
    return true;
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    throw error;
  }
}

// Остальные функции без изменений...
async function getUserByUsername(username) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error getting user by username:', error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error getting user by ID:', error);
    throw error;
  }
}

async function createUser(userData) {
  try {
    const { username, password, role = 'user' } = userData;
    
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [username, password, role]
    );
    
    console.log(`✅ User created: ${username}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting all users:', error);
    throw error;
  }
}

async function updateApplicationStatus(id, status) {
  try {
    const result = await pool.query(`
      UPDATE car_applications 
      SET status = $1, "reviewedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    throw error;
  }
}

async function getPendingApplicationsCount() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM car_applications
      WHERE status = 'pending'
    `);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('❌ Error getting pending applications count:', error);
    throw error;
  }
}

async function updateUserRole(userId, role) {
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      [role, userId]
    );
    
    console.log(`✅ User ${userId} role updated to: ${role}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw error;
  }
}

module.exports = {
  // Users
  getUserByUsername,
  getUserById,
  createUser,
  getAllUsers,
  updateUserRole,
  
  // Applications
  getApplications,
  getUserApplications,
  createApplication,
  updateApplicationStatus,
  
  // Car listings
  getCarListings,
  getUserCarListings,
  getCarListingById,
  createCarListing,
  
  // Messages
  getMessages,
  getAllMessages,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessageCount,
  
  // Favorites
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  
  // Stats
  getPendingApplicationsCount
};
