const express = require('express');
const bcrypt = require('bcrypt');
const storage = require('./storage-fixed');
const { validatePassword } = require('./utils');

const router = express.Router();

// Middleware для проверки аутентификации
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    console.log('🔐 Auth check: User:', req.user.username);
    return next();
  }
  console.log('❌ Auth required but user not authenticated');
  res.status(401).json({ error: 'Authentication required' });
}

// Middleware для проверки роли
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = req.session.user.role;
    console.log('🛡️ Role check:', userRole);
    
    if (roles.includes(userRole)) {
      return next();
    }
    
    console.log('❌ Access denied. Required roles:', roles, 'User role:', userRole);
    res.status(403).json({ error: 'Insufficient permissions' });
  };
}

// Аутентификация
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔑 Login attempt for:', username);
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      
      const responseData = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };
      
      console.log('✅ Login successful for:', user.username);
      res.json(responseData);
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('📝 Registration attempt for:', username);
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Валидация пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid password',
        details: passwordValidation.errors
      });
    }
    
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      console.log('❌ User already exists:', username);
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      role: 'user'
    });
    
    console.log('✅ User registered:', username);
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/auth/logout', (req, res) => {
  const username = req.session?.user?.username || 'Unknown';
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log('✅ User logged out:', username);
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/auth/me', (req, res) => {
  console.log('👤 User info requested');
  
  if (req.session && req.session.user) {
    const userData = {
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        role: req.session.user.role
      }
    };
    console.log('✅ Returning user data:', userData);
    res.json(userData);
  } else {
    console.log('❌ No user in session');
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// === ЗАЯВКИ ===
router.post('/applications', requireAuth, async (req, res) => {
  try {
    console.log('📝 Creating application for user:', req.user.username);
    console.log('📋 RAW request body:', req.body);
    
    // ✅ ДОБАВЛЕНА ВАЛИДАЦИЯ
    if (!req.body.name || !req.body.category || !req.body.server || !req.body.price) {
      return res.status(400).json({ 
        error: 'Обязательные поля не заполнены',
        missing: {
          name: !req.body.name,
          category: !req.body.category,
          server: !req.body.server,
          price: !req.body.price
        }
      });
    }
    
    const applicationData = {
      ...req.body,
      createdBy: req.user.id,
      status: 'pending'
    };
    
    console.log('📝 Creating application with data:', applicationData);
    
    const application = await storage.createApplication(applicationData);
    
    console.log('✅ Application created successfully:', application.id);
    res.status(201).json(application);
    
  } catch (error) {
    console.error('❌ Error creating application:', error);
    console.error('❌ Stack trace:', error.stack); // ✅ ДОБАВЛЕН СТЕК ТРЕЙС
    res.status(500).json({ 
      error: 'Ошибка создания заявки',
      details: error.message 
    });
  }
});

router.get('/applications/pending', requireAuth, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    console.log('📋 Fetching pending applications for:', req.user.username);
    const applications = await storage.getApplications();
    const pendingApplications = applications.filter(app => app.status === 'pending');
    
    console.log('📦 Found pending applications:', pendingApplications.length);
    res.json(pendingApplications);
  } catch (error) {
    console.error('❌ Error fetching pending applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.get('/my-applications', requireAuth, async (req, res) => {
  try {
    console.log('📋 Fetching applications for user:', req.user.username);
    const applications = await storage.getUserApplications(req.user.id);
    
    console.log('📦 Found user applications:', applications.length);
    res.json(applications);
  } catch (error) {
    console.error('❌ Error fetching user applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.patch('/applications/:id/status', requireAuth, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔄 Updating application status:', id, 'to:', status, 'by:', req.user.username);
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const application = await storage.updateApplicationStatus(id, status);
    
    // Создание объявления при одобрении
    if (status === 'approved') {
      console.log('✅ Creating car listing from approved application');
      console.log('📋 Application data for car listing:', application);
      
      try {
        await storage.createCarListing({
          name: application.name,
          price: application.price,
          description: application.description,
          category: application.category,
          server: application.server,
          maxSpeed: application.maxSpeed,
          acceleration: application.acceleration,
          drive: application.drive,
          isPremium: application.isPremium || false,
          phone: application.phone,
          telegram: application.telegram,
          discord: application.discord,
          imageUrl: application.imageUrl,
          owner_id: application.createdBy,
          application_id: application.id
        });
        
        console.log('✅ Car listing created successfully from application');
        
      } catch (carError) {
        console.error('❌ Error creating car listing:', carError);
      }
    }
    
    console.log('✅ Application status updated successfully');
    res.json(application);
    
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// === АВТОМОБИЛИ ===
router.get('/cars', async (req, res) => {
  try {
    console.log('🚗 Fetching all cars');
    const cars = await storage.getCarListings();
    
    console.log(`✅ Found ${cars.length} cars`);
    res.json(cars);
  } catch (error) {
    console.error('❌ Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

router.get('/my-cars', requireAuth, async (req, res) => {
  try {
    console.log('🚗 Fetching cars for user:', req.user.username);
    
    const cars = await storage.getUserCarListings(req.user.id);
    
    console.log(`✅ Found ${cars.length} cars for user ${req.user.id}`);
    res.json(cars);
    
  } catch (error) {
    console.error('❌ Error fetching user cars:', error);
    res.status(500).json({ error: 'Failed to fetch user cars' });
  }
});

// Обновление автомобиля
router.put('/cars/:id', requireAuth, async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`✏️ Update car request: ID ${carId} by user ${req.user.username}`);

    if (!carId || isNaN(carId)) {
      return res.status(400).json({ error: 'Неверный ID автомобиля' });
    }

    // Получить информацию об автомобиле
    const car = await storage.getCarListingById(carId);
    
    if (!car) {
      console.log('❌ Car not found:', carId);
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    // Проверка прав: владелец или админ
    const isOwner = car.owner_id === userId;
    const canEdit = isOwner || userRole === 'admin';

    if (!canEdit) {
      console.log('❌ Insufficient permissions to edit car:', carId, 'User:', req.user.username);
      return res.status(403).json({ error: 'Недостаточно прав для редактирования этого автомобиля' });
    }

    // Обновить автомобиль
    const updatedCar = await storage.updateCarListing(carId, req.body);

    console.log(`✅ Car ${carId} updated successfully by ${req.user.username}`);
    res.json(updatedCar);

  } catch (error) {
    console.error('❌ Error updating car:', error);
    res.status(500).json({ 
      error: 'Ошибка при обновлении автомобиля',
      details: error.message 
    });
  }
});

// Удаление автомобиля
router.delete('/cars/:id', requireAuth, async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`🗑️ Delete car request: ID ${carId} by user ${req.user.username} (${userRole})`);

    if (!carId || isNaN(carId)) {
      return res.status(400).json({ error: 'Неверный ID автомобиля' });
    }

    // Получить информацию об автомобиле
    const car = await storage.getCarListingById(carId);
    
    if (!car) {
      console.log('❌ Car not found:', carId);
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    // Проверка прав: владелец, админ или модератор
    const isOwner = car.owner_id === userId;
    const canDelete = isOwner || userRole === 'admin' || userRole === 'moderator';

    if (!canDelete) {
      console.log('❌ Insufficient permissions to delete car:', carId, 'User:', req.user.username, 'Role:', userRole);
      return res.status(403).json({ error: 'Недостаточно прав для удаления этого автомобиля' });
    }

    // Удалить автомобиль
    await storage.deleteCarListing(carId);

    console.log(`✅ Car ${carId} deleted successfully by ${req.user.username}`);
    res.json({ message: 'Автомобиль успешно удален' });

  } catch (error) {
    console.error('❌ Error deleting car:', error);
    res.status(500).json({ 
      error: 'Ошибка при удалении автомобиля',
      details: error.message 
    });
  }
});

// === СООБЩЕНИЯ ===
router.post('/messages', requireAuth, async (req, res) => {
  try {
    console.log('💌 Creating message from:', req.user.username);
    
    const messageData = {
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      carId: req.body.carId,
      content: req.body.content
    };
    
    console.log('📋 Message data:', messageData);
    
    const message = await storage.createMessage(messageData);
    
    console.log('✅ Message created successfully');
    res.status(201).json(message);
    
  } catch (error) {
    console.error('❌ Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

router.get('/messages', requireAuth, async (req, res) => {
  try {
    console.log('📬 Fetching messages for user:', req.user.username);
    
    const messages = await storage.getMessages(req.user.id);
    
    console.log(`✅ Found ${messages.length} messages for user ${req.user.id}`);
    res.json(messages);
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/messages/all', requireAuth, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    console.log('📬 Fetching all messages for:', req.user.username);
    
    const messages = await storage.getAllMessages();
    
    console.log(`✅ Found ${messages.length} total messages`);
    res.json(messages);
    
  } catch (error) {
    console.error('❌ Error fetching all messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.patch('/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    
    console.log(`📖 Marking message ${messageId} as read by ${req.user.username}`);
    
    const message = await storage.markMessageAsRead(messageId, req.user.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }
    
    console.log('✅ Message marked as read');
    res.json(message);
    
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

router.delete('/messages/:id', requireAuth, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    
    console.log(`🗑️ Deleting message ${messageId} by ${req.user.username}`);
    
    const deletedMessage = await storage.deleteMessage(messageId);
    
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    console.log('✅ Message deleted successfully');
    res.json({ message: 'Message deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// ✅ ДОБАВЛЕН НЕДОСТАЮЩИЙ ENDPOINT
router.get('/messages/unread-count', requireAuth, async (req, res) => {
  try {
    console.log('📊 Getting unread message count for user:', req.user.username);
    
    const count = await storage.getUnreadMessageCount(req.user.id);
    
    console.log(`✅ Unread count for ${req.user.username}: ${count}`);
    res.json({ count });
    
  } catch (error) {
    console.error('❌ Error getting unread message count:', error);
    res.status(500).json({ error: 'Failed to get unread message count' });
  }
});

// === ИЗБРАННОЕ ===
router.post('/favorites/:carId', requireAuth, async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const userId = req.user.id;
    
    console.log(`❤️ Adding car ${carId} to favorites for user ${req.user.username}`);
    
    const favorite = await storage.addToFavorites(userId, carId);
    
    console.log('✅ Car added to favorites');
    res.status(201).json(favorite);
    
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

router.delete('/favorites/:carId', requireAuth, async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const userId = req.user.id;
    
    console.log(`💔 Removing car ${carId} from favorites for user ${req.user.username}`);
    
    const removedFavorite = await storage.removeFromFavorites(userId, carId);
    
    console.log('✅ Car removed from favorites');
    res.json({ message: 'Removed from favorites' });
    
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

router.get('/favorites', requireAuth, async (req, res) => {
  try {
    console.log('❤️ Fetching favorites for user:', req.user.username);
    
    const favorites = await storage.getUserFavorites(req.user.id);
    
    console.log(`✅ Found ${favorites.length} favorites for user ${req.user.id}`);
    res.json(favorites);
    
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// === АДМИН ПАНЕЛЬ ===
router.get('/admin/users', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    console.log('👥 Fetching all users for admin:', req.user.username);
    
    const users = await storage.getAllUsers();
    
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/admin/stats', requireAuth, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    console.log('📊 Fetching admin stats for:', req.user.username);
    
    const [pendingApplicationsCount, unmoderatedMessagesCount] = await Promise.all([
      storage.getPendingApplicationsCount(),
      storage.getUnmoderatedMessagesCount()
    ]);
    
    const stats = {
      pendingApplications: pendingApplicationsCount,
      unmoderatedMessages: unmoderatedMessagesCount
    };
    
    console.log('✅ Admin stats:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Маршруты для работы с автомобилями
router.post('/api/cars', async (req, res) => {
  try {
    const { brand, model, year, price, description, images } = req.body;
    
    // Проверяем авторизацию
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    // Создаем новую карточку автомобиля
    const car = await storage.createCarListing({
      user_id: req.session.userId,
      brand,
      model,
      year,
      price,
      description,
      images,
      status: 'pending'
    });

    res.json(car);
  } catch (error) {
    console.error('Ошибка при создании карточки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение карточек на модерацию
router.get('/api/cars/pending', async (req, res) => {
  try {
    // Проверяем права модератора
    if (!req.session.userId || req.session.userRole !== 'admin') {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    const cars = await storage.getPendingCarListings();

    res.json(cars);
  } catch (error) {
    console.error('Ошибка при получении карточек:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Модерация карточки
PS E:\rmrp-shop> npm start

> rmrp-shop@1.0.0 start
> node server/index.js

node:internal/modules/cjs/loader:1404
  throw err;
  ^

Error: Cannot find module 'E:\rmrp-shop\server\index.js'
    at Function._resolveFilename (node:internal/modules/cjs/loader:1401:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1057:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1062:22)
    at Function._load (node:internal/modules/cjs/loader:1211:37)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v22.15.1
PS E:\rmrp-shop> 

// Получение одобренных карточек для каталога
router.get('/api/cars', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    let sortQuery = '';
    switch (sort) {
      case 'price_asc':
        sortQuery = 'ORDER BY price ASC';
        break;
      case 'price_desc':
        sortQuery = 'ORDER BY price DESC';
        break;
      case 'oldest':
        sortQuery = 'ORDER BY created_at ASC';
        break;
      default:
        sortQuery = 'ORDER BY created_at DESC';
    }

    const cars = await storage.getApprovedCarListings(limit, offset, sortQuery);

    const total = await storage.getApprovedCarListingsCount();

    res.json({
      cars: cars.rows,
      total: parseInt(total.rows[0].count),
      pages: Math.ceil(total.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Ошибка при получении каталога:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
