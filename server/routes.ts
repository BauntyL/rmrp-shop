import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, insertProductSchema, insertMessageSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);
    
    if (!user || user.isBanned) {
      return res.status(401).json({ message: 'User not found or banned' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin/moderator role
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('Initializing routes...');
  
  // Запускаем инициализацию в фоне, не блокируя сервер
  Promise.resolve().then(async () => {
    try {
      console.log('Initializing servers...');
      await storage.initializeServers();
      console.log('Initializing categories...');
      await storage.initializeCategories();
      console.log('Database initialization complete');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const registerSchema = insertUserSchema.extend({
        confirmPassword: z.string(),
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) || 
                          await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const { confirmPassword, ...userToCreate } = userData;
      const user = await storage.createUser({
        ...userToCreate,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { login, password } = req.body;
      
      if (!login || !password) {
        return res.status(400).json({ message: 'Login and password required' });
      }

      // Find user by email or username
      const user = await storage.getUserByEmail(login) || 
                   await storage.getUserByUsername(login);
      
      if (!user || user.isBanned) {
        return res.status(401).json({ message: 'Invalid credentials or user banned' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  // Server routes
  app.get('/api/servers', async (req, res) => {
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch servers' });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      const categories = await storage.getCategoriesByParent(parentId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        serverId: req.query.serverId ? parseInt(req.query.serverId as string) : undefined,
        status: req.query.status as string || 'approved',
        search: req.query.search as string,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
      };
  
      // Add this debug logging
      console.log('API Request filters:', filters);
      
      const products = await storage.getProducts(filters);
      
      // Add this debug logging
      console.log('Returned products count:', products.length);
      console.log('Products categoryIds:', products.map(p => ({ title: p.title, categoryId: p.categoryId })));
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch product' });
    }
  });

  app.post('/api/products', authenticateToken, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create product' });
    }
  });

  app.get('/api/my-products', authenticateToken, async (req: any, res) => {
    try {
      const products = await storage.getUserProducts(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user products' });
    }
  });

  // Favorite routes
  app.get('/api/favorites', authenticateToken, async (req: any, res) => {
    try {
      const favorites = await storage.getFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  app.post('/api/favorites/:productId', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;

      const isAlreadyFavorite = await storage.isFavorite(userId, productId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: 'Already in favorites' });
      }

      const favorite = await storage.addFavorite({ userId, productId });
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: 'Failed to add favorite' });
    }
  });

  app.delete('/api/favorites/:productId', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;

      await storage.removeFavorite(userId, productId);
      res.json({ message: 'Removed from favorites' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove favorite' });
    }
  });

  app.get('/api/favorites/:productId/check', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = req.user.id;

      const isFavorite = await storage.isFavorite(userId, productId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: 'Failed to check favorite status' });
    }
  });

  // Conversation routes
  // Обновляем роут для получения диалогов
  app.get('/api/conversations', authenticateToken, async (req: any, res) => {
    try {
      const conversations = await storage.getConversationsWithUnreadCount(req.user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  // Добавляем роут для получения количества непрочитанных сообщений
  app.get('/api/messages/unread-count', authenticateToken, async (req: any, res) => {
    try {
      const count = await storage.getUnreadMessagesCount(req.user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch unread count' });
    }
  });

  // Обновляем роут для получения сообщений
  app.get('/api/conversations/:id/messages', authenticateToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.id;

      const conversation = await storage.getConversation(conversationId);
      if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const messages = await storage.getMessages(conversationId);
      
      // Помечаем сообщения как прочитанные
      await storage.markMessagesAsRead(conversationId, userId);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/conversations/:id/messages', authenticateToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.id;

      // Verify user is part of conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
        senderId: userId,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to send message' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.patch('/api/admin/users/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  app.patch('/api/admin/users/:id/ban', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { reason } = req.body;

      const user = await storage.banUser(userId, reason);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to ban user' });
    }
  });

  app.patch('/api/admin/users/:id/unban', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      const user = await storage.unbanUser(userId);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to unban user' });
    }
  });

  app.get('/api/admin/products/pending', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
      const products = await storage.getPendingProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending products' });
    }
  });

  app.patch('/api/admin/products/:id/status', authenticateToken, requireRole(['admin', 'moderator']), async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { status, note } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const product = await storage.updateProductStatus(productId, status, req.user.id, note);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product status' });
    }
  });

  app.get('/api/admin/messages/pending', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
      const messages = await storage.getPendingMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending messages' });
    }
  });

  app.patch('/api/admin/messages/:id/moderate', authenticateToken, requireRole(['admin', 'moderator']), async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);

      const message = await storage.moderateMessage(messageId, req.user.id);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Failed to moderate message' });
    }
  });

  // Обновление цены продукта (только владелец)
  app.patch('/api/products/:id/price', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { price } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!price || price <= 0) {
        return res.status(400).json({ message: 'Invalid price' });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Проверка прав: владелец, модератор или админ
      if (product.userId !== userId && userRole !== 'moderator' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedProduct = await storage.updateProductPrice(productId, price);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product price error:', error);
      res.status(500).json({ message: 'Failed to update product price' });
    }
  });

  // Полное редактирование продукта (модераторы и админы)
  app.put('/api/products/:id', authenticateToken, requireRole(['moderator', 'admin']), async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const updates = req.body;

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const updatedProduct = await storage.updateProduct(productId, updates);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  });

  // Удаление продукта
  app.delete('/api/products/:id', authenticateToken, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Проверка прав: владелец, модератор или админ
      if (product.userId !== userId && userRole !== 'moderator' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteProduct(productId);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  console.log('Routes registered successfully');
  const httpServer = createServer(app);
  return httpServer;
}

## 2. Очистите кэш браузера

Проблема может быть связана с кэшированием:
- Нажмите Ctrl+F5 для жесткого обновления
- Очистите кэш браузера и cookies
- Попробуйте открыть сайт в режиме инкогнито

## 3. Проверьте Network запросы

Откройте DevTools → Network и проверьте:

**Для страницы Рыба:**
- URL должен быть: `/api/products?categoryId=3`
- Ответ должен содержать только продукты с `categoryId: 3`

**Для страницы Недвижимость:**
- URL должен быть: `/api/products?categoryId=2`
- Ответ должен содержать только продукты с `categoryId: 2`

**Для страницы Клады:**
- URL должен быть: `/api/products?categoryId=4`
- Ответ должен содержать только продукты с `categoryId: 4`

## 4. Временное решение для отладки

Добавьте логирование в API эндпоинт для отладки. В <mcfile name="routes.ts" path="e:\RMRPTP\rmrp-shop\rmrp-shop\server\routes.ts"></mcfile> измените эндпоинт `/api/products`:
```typescript
app.get('/api/products', async (req, res) => {
  try {
    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
      serverId: req.query.serverId ? parseInt(req.query.serverId as string) : undefined,
      status: req.query.status as string || 'approved',
      search: req.query.search as string,
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
    };

    // Добавляем отладочное логирование
    console.log('🔍 API Request filters:', JSON.stringify(filters, null, 2));
    console.log('🔍 Raw query params:', req.query);
    
    const products = await storage.getProducts(filters);
    
    // Логируем результаты
    console.log('📦 Products found:', products.length);
    console.log('📦 Products by category:', products.reduce((acc, p) => {
      acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>));
    
    // Логируем конкретные продукты с "Гелик"
    const gelikProducts = products.filter(p => p.title.includes('Гелик'));
    if (gelikProducts.length > 0) {
      console.log('🚗 Гелик products found:', gelikProducts.map(p => ({
        id: p.id,
        title: p.title,
        categoryId: p.categoryId
      })));
    }
    
    res.json(products);
  } catch (error) {
    console.error('❌ Error in /api/products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});