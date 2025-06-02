import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, insertProductSchema, insertMessageSchema } from "@shared/schema";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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
    
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin/moderator role
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
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

  app.get('/api/auth/me', authenticateToken, async (req: Request, res) => {
    res.json({ ...(req as any).user, password: undefined });
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

  app.patch('/api/admin/products/:id/status', authenticateToken, requireRole(['admin', 'moderator']), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { status, note } = req.body;
  
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const product = await storage.updateProductStatus(productId, status, (req as any).user.id, note);
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

  app.patch('/api/admin/messages/:id/moderate', authenticateToken, requireRole(['admin', 'moderator']), async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
  
      const message = await storage.moderateMessage(messageId, (req as any).user.id);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Failed to moderate message' });
    }
  });

  // Обновление цены продукта (только владелец)
  app.patch('/api/products/:id/price', authenticateToken, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { price } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
  
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
  app.put('/api/products/:id', authenticateToken, requireRole(['moderator', 'admin']), async (req: Request, res: Response) => {
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
  app.delete('/api/products/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
  
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

  // Создание продукта
  app.post('/api/products', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const productData = {
        ...req.body,
        userId,
        status: 'pending', // Все новые товары требуют модерации
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating product with data:', JSON.stringify(productData, null, 2));

      try {
        // Валидация данных
        const validatedData = insertProductSchema.parse(productData);
        console.log('Validated data:', JSON.stringify(validatedData, null, 2));
        
        const product = await storage.createProduct(validatedData);
        console.log('Created product:', JSON.stringify(product, null, 2));
        
        res.status(201).json(product);
      } catch (validationError) {
        console.error('Validation error:', validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({
            message: 'Validation error',
            errors: validationError.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          });
        }
        throw validationError;
      }
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to create product',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
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

  app.patch('/api/admin/products/:id/status', authenticateToken, requireRole(['admin', 'moderator']), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { status, note } = req.body;
  
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const product = await storage.updateProductStatus(productId, status, (req as any).user.id, note);
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

  app.patch('/api/admin/messages/:id/moderate', authenticateToken, requireRole(['admin', 'moderator']), async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
  
      const message = await storage.moderateMessage(messageId, (req as any).user.id);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: 'Failed to moderate message' });
    }
  });

  // Обновление цены продукта (только владелец)
  app.patch('/api/products/:id/price', authenticateToken, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { price } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
  
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
  app.put('/api/products/:id', authenticateToken, requireRole(['moderator', 'admin']), async (req: Request, res: Response) => {
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
  app.delete('/api/products/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
  
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