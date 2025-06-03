import {
  users,
  products,
  categories,
  servers,
  favorites,
  conversations,
  messages,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type Server,
  type Favorite,
  type InsertFavorite,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, like, sql, ne, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  banUser(id: number, reason: string): Promise<User>;
  unbanUser(id: number): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Server operations
  getServers(): Promise<Server[]>;
  initializeServers(): Promise<void>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoriesByParent(parentId?: number): Promise<Category[]>;
  initializeCategories(): Promise<void>;

  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    serverId?: number;
    status?: string;
    search?: string;
    userId?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStatus(id: number, status: string, moderatorId?: number, note?: string): Promise<Product>;
  getUserProducts(userId: number): Promise<Product[]>;
  getPendingProducts(filters?: {
    categoryId?: string;
    serverId?: string;
  }): Promise<any[]>;
  // Новые методы для редактирования и удаления
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  updateProductPrice(id: number, price: number): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Favorite operations
  getFavorites(userId: number): Promise<Product[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, productId: number): Promise<void>;
  isFavorite(userId: number, productId: number): Promise<boolean>;

  // Conversation operations
  getConversations(userId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  findExistingConversation(user1Id: number, user2Id: number, productId?: number): Promise<Conversation | undefined>;

  // Message operations
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  moderateMessage(id: number, moderatorId: number): Promise<Message>;
  getPendingMessages(): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      })
      .from(users)
      .where(eq(users.id, id));

    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      })
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      });

    return newUser;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      });

    return user;
  }

  async banUser(id: number, reason: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned: true, banReason: reason, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      });

    return user;
  }

  async unbanUser(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned: false, banReason: null, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      });

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        username: users.username,
        password: users.password,
        role: users.role,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileImageUrl: users.profileImageUrl,
        productsCount: sql<number>`(
          select count(*)
          from ${products}
          where ${products.userId} = ${users.id}
        )`,
        messagesCount: sql<number>`(
          select count(*)
          from ${messages}
          where ${messages.senderId} = ${users.id}
        )`,
      })
      .from(users)
      .orderBy(asc(users.createdAt));
  }

  // Server operations
  async getServers(): Promise<Server[]> {
    return await db.select().from(servers).orderBy(asc(servers.name));
  }

  async initializeServers(): Promise<void> {
    const serverData = [
      { name: "arbat", displayName: "Арбат" },
      { name: "patriki", displayName: "Патрики" },
      { name: "rublevka", displayName: "Рублевка" },
      { name: "tverskoy", displayName: "Тверской" },
    ];

    for (const server of serverData) {
      await db
        .insert(servers)
        .values(server)
        .onConflictDoNothing();
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoriesByParent(parentId?: number): Promise<Category[]> {
    if (parentId === undefined) {
      return await db
        .select()
        .from(categories)
        .where(sql`${categories.parentId} IS NULL`)
        .orderBy(asc(categories.name));
    }
    return await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, parentId))
      .orderBy(asc(categories.name));
  }

  async initializeCategories(): Promise<void> {
    // Main categories
    const mainCategories = [
      { name: "cars", displayName: "Автомобили", icon: "fas fa-car", color: "59, 130, 246" },
      { name: "realestate", displayName: "Недвижимость", icon: "fas fa-home", color: "16, 185, 129" },
      { name: "fish", displayName: "Рыба", icon: "fas fa-fish", color: "6, 182, 212" },
      { name: "treasures", displayName: "Клады", icon: "fas fa-gem", color: "139, 92, 246" },
    ];

    const categoryMap = new Map();

    for (const category of mainCategories) {
      const [existing] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, category.name));
      
      if (!existing) {
        const [newCategory] = await db
          .insert(categories)
          .values(category)
          .returning();
        categoryMap.set(category.name, newCategory.id);
      } else {
        categoryMap.set(category.name, existing.id);
      }
    }

    // Subcategories
    const subcategories = [
      // Car subcategories
      { name: "cars_standard", displayName: "Стандарт", icon: "fas fa-car", color: "59, 130, 246", parentId: categoryMap.get("cars") },
      { name: "cars_sport", displayName: "Спорт", icon: "fas fa-car-side", color: "59, 130, 246", parentId: categoryMap.get("cars") },
      { name: "cars_suv", displayName: "Внедорожники", icon: "fas fa-truck", color: "59, 130, 246", parentId: categoryMap.get("cars") },
      { name: "cars_coupe", displayName: "Купе", icon: "fas fa-car", color: "59, 130, 246", parentId: categoryMap.get("cars") },
      { name: "cars_motorcycle", displayName: "Мотоциклы", icon: "fas fa-motorcycle", color: "59, 130, 246", parentId: categoryMap.get("cars") },
      { name: "cars_special", displayName: "Специальные", icon: "fas fa-truck-monster", color: "59, 130, 246", parentId: categoryMap.get("cars") },
      
      // Fish subcategories
      { name: "fish_roach", displayName: "Плотва", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_ruff", displayName: "Ерш", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_trout", displayName: "Форель", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_bream", displayName: "Лещ", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_ide", displayName: "Язь", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_catfish", displayName: "Сом", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_pike", displayName: "Щука", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      { name: "fish_sturgeon", displayName: "Осетр", icon: "fas fa-fish", color: "6, 182, 212", parentId: categoryMap.get("fish") },
      
      // Real estate subcategories
      { name: "realestate_house", displayName: "Дом", icon: "fas fa-home", color: "16, 185, 129", parentId: categoryMap.get("realestate") },
      { name: "realestate_cottage", displayName: "Коттедж", icon: "fas fa-house-chimney", color: "16, 185, 129", parentId: categoryMap.get("realestate") },
      { name: "realestate_apartment", displayName: "Квартира", icon: "fas fa-building", color: "16, 185, 129", parentId: categoryMap.get("realestate") },
      { name: "realestate_business", displayName: "Бизнес", icon: "fas fa-briefcase", color: "16, 185, 129", parentId: categoryMap.get("realestate") },
    ];

    for (const subcategory of subcategories) {
      await db
        .insert(categories)
        .values(subcategory)
        .onConflictDoNothing();
    }
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: number;
    serverId?: number;
    status?: string;
    search?: string;
    userId?: number;
  }): Promise<Product[]> {
    console.log('🗄️ Storage getProducts called with filters:', JSON.stringify(filters, null, 2));
    
    const conditions = [];
    
    if (filters?.categoryId) {
      console.log('🔍 Adding categoryId filter:', filters.categoryId);
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.serverId) {
      conditions.push(eq(products.serverId, filters.serverId));
    }
    
    if (filters?.status) {
      conditions.push(eq(products.status, filters.status));
    } else {
      conditions.push(eq(products.status, "approved"));
    }
    
    if (filters?.userId) {
      conditions.push(eq(products.userId, filters.userId));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(products.title, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }

    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        serverId: products.serverId,
        userId: products.userId,
        images: products.images,
        metadata: products.metadata,
        status: products.status,
        moderatorId: products.moderatorId,
        moderatorNote: products.moderatorNote,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          displayName: categories.displayName,
          color: categories.color,
        },
        server: {
          id: servers.id,
          name: servers.name,
          displayName: servers.displayName,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(servers, eq(products.serverId, servers.id))
      .leftJoin(users, eq(products.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        serverId: products.serverId,
        userId: products.userId,
        images: products.images,
        metadata: products.metadata,
        status: products.status,
        moderatorId: products.moderatorId,
        moderatorNote: products.moderatorNote,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          displayName: categories.displayName,
          color: categories.color,
          name: categories.name,
        },
        server: {
          displayName: servers.displayName,
          name: servers.name,
        },
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(servers, eq(products.serverId, servers.id))
      .leftJoin(users, eq(products.userId, users.id))
      .where(eq(products.id, id));

    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    console.log('🗄️ Storage createProduct called with:', JSON.stringify(product, null, 2));
    
    // Проверяем обязательные поля
    if (!product.title || !product.description || !product.price || !product.categoryId || !product.serverId || !product.userId) {
      console.error('🚫 Missing required fields:', {
        title: !product.title,
        description: !product.description,
        price: !product.price,
        categoryId: !product.categoryId,
        serverId: !product.serverId,
        userId: !product.userId
      });
      throw new Error('Missing required fields');
    }

    // Проверяем, что цена положительная
    if (product.price <= 0) {
      console.error('🚫 Invalid price:', product.price);
      throw new Error('Price must be positive');
    }

    // Проверяем существование категории
    console.log('🔍 Checking category:', product.categoryId);
    const categoryResult = await db.select().from(categories).where(eq(categories.id, product.categoryId));
    if (!categoryResult.length) {
      console.error('🚫 Category not found:', product.categoryId);
      throw new Error('Category not found');
    }
    console.log('✅ Category found:', categoryResult[0]);

    // Проверяем существование сервера
    console.log('🔍 Checking server:', product.serverId);
    const serverResult = await db.select().from(servers).where(eq(servers.id, product.serverId));
    if (!serverResult.length) {
      console.error('🚫 Server not found:', product.serverId);
      throw new Error('Server not found');
    }
    console.log('✅ Server found:', serverResult[0]);

    // Проверяем существование пользователя
    console.log('🔍 Checking user:', product.userId);
    const userResult = await db.select().from(users).where(eq(users.id, product.userId));
    if (!userResult.length) {
      console.error('🚫 User not found:', product.userId);
      throw new Error('User not found');
    }
    console.log('✅ User found:', userResult[0]);

    try {
      console.log('📝 Inserting product:', JSON.stringify(product, null, 2));
      const [newProduct] = await db.insert(products).values(product).returning();
      console.log('✅ Created product:', JSON.stringify(newProduct, null, 2));
      return newProduct;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw error;
    }
  }

  async updateProductStatus(id: number, status: string, moderatorId?: number, note?: string): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        status,
        moderatorId,
        moderatorNote: note,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        serverId: products.serverId,
        userId: products.userId,
        images: products.images,
        metadata: products.metadata,
        status: products.status,
        moderatorId: products.moderatorId,
        moderatorNote: products.moderatorNote,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          displayName: categories.displayName,
          color: categories.color,
        },
        server: {
          id: servers.id,
          name: servers.name,
          displayName: servers.displayName,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(servers, eq(products.serverId, servers.id))
      .leftJoin(users, eq(products.userId, users.id))
      .where(eq(products.userId, userId))
      .orderBy(desc(products.createdAt));
  }

  async getPendingProducts(filters: {
    categoryId?: string;
    serverId?: string;
  } = {}): Promise<any[]> {
    const conditions = [eq(products.status, "pending")];

    if (filters.categoryId && filters.categoryId !== "all") {
      conditions.push(eq(products.categoryId, parseInt(filters.categoryId)));
    }

    if (filters.serverId && filters.serverId !== "all") {
      conditions.push(eq(products.serverId, parseInt(filters.serverId)));
    }

    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        serverId: products.serverId,
        userId: products.userId,
        images: products.images,
        metadata: products.metadata,
        status: products.status,
        moderatorId: products.moderatorId,
        moderatorNote: products.moderatorNote,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          displayName: categories.displayName,
          color: categories.color,
        },
        server: {
          id: servers.id,
          name: servers.name,
          displayName: servers.displayName,
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(servers, eq(products.serverId, servers.id))
      .leftJoin(users, eq(products.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }

  // Новые методы для редактирования и удаления продуктов
  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async updateProductPrice(id: number, price: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        price,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Favorite operations
  async getFavorites(userId: number): Promise<Product[]> {
    const favoriteProducts = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        serverId: products.serverId,
        userId: products.userId,
        images: products.images,
        metadata: products.metadata,
        status: products.status,
        moderatorId: products.moderatorId,
        moderatorNote: products.moderatorNote,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          displayName: categories.displayName,
          color: categories.color,
          name: categories.name,
        },
        server: {
          displayName: servers.displayName,
          name: servers.name,
        },
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
      })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(servers, eq(products.serverId, servers.id))
      .leftJoin(users, eq(products.userId, users.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    
    return favoriteProducts;
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: number, productId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
    return !!favorite;
  }

  // Conversation operations
  async getConversations(userId: number): Promise<Conversation[]> {
    return await db
      .select({
        id: conversations.id,
        user1Id: conversations.user1Id,
        user2Id: conversations.user2Id,
        productId: conversations.productId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        user1: sql<any>`(
          select json_build_object(
            'id', u1.id,
            'firstName', u1.first_name,
            'lastName', u1.last_name,
            'profileImageUrl', u1.profile_image_url,
            'username', u1.username
          )
          from ${users} u1
          where u1.id = ${conversations.user1Id}
        )`,
        user2: sql<any>`(
          select json_build_object(
            'id', u2.id,
            'firstName', u2.first_name,
            'lastName', u2.last_name,
            'profileImageUrl', u2.profile_image_url,
            'username', u2.username
          )
          from ${users} u2
          where u2.id = ${conversations.user2Id}
        )`,
        product: sql<any>`(
          select json_build_object(
            'id', p.id,
            'title', p.title,
            'description', p.description,
            'price', p.price,
            'images', p.images,
            'status', p.status,
            'category', json_build_object(
              'id', c.id,
              'displayName', c.display_name,
              'color', c.color,
              'name', c.name
            ),
            'server', json_build_object(
              'id', s.id,
              'displayName', s.display_name,
              'name', s.name
            )
          )
          from ${products} p
          left join ${categories} c on c.id = p.category_id
          left join ${servers} s on s.id = p.server_id
          where p.id = ${conversations.productId}
        )`,
      })
      .from(conversations)
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select({
        id: conversations.id,
        user1Id: conversations.user1Id,
        user2Id: conversations.user2Id,
        productId: conversations.productId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        user1: sql<any>`(
          select json_build_object(
            'id', u1.id,
            'firstName', u1.first_name,
            'lastName', u1.last_name,
            'profileImageUrl', u1.profile_image_url,
            'username', u1.username
          )
          from ${users} u1
          where u1.id = ${conversations.user1Id}
        )`,
        user2: sql<any>`(
          select json_build_object(
            'id', u2.id,
            'firstName', u2.first_name,
            'lastName', u2.last_name,
            'profileImageUrl', u2.profile_image_url,
            'username', u2.username
          )
          from ${users} u2
          where u2.id = ${conversations.user2Id}
        )`,
        product: sql<any>`(
          select json_build_object(
            'id', p.id,
            'title', p.title,
            'description', p.description,
            'price', p.price,
            'images', p.images,
            'status', p.status,
            'category', json_build_object(
              'id', c.id,
              'displayName', c.display_name,
              'color', c.color,
              'name', c.name
            ),
            'server', json_build_object(
              'id', s.id,
              'displayName', s.display_name,
              'name', s.name
            )
          )
          from ${products} p
          left join ${categories} c on c.id = p.category_id
          left join ${servers} s on s.id = p.server_id
          where p.id = ${conversations.productId}
        )`,
      })
      .from(conversations)
      .where(eq(conversations.id, id));

    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async findExistingConversation(user1Id: number, user2Id: number, productId?: number): Promise<Conversation | undefined> {
    const conditions = [
      or(
        and(eq(conversations.user1Id, user1Id), eq(conversations.user2Id, user2Id)),
        and(eq(conversations.user1Id, user2Id), eq(conversations.user2Id, user1Id))
      )
    ];

    if (productId) {
      conditions.push(eq(conversations.productId, productId));
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(...conditions));

    return conversation;
  }

  // Message operations
  async getMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        isModerated: messages.isModerated,
        moderatorId: messages.moderatorId,
        senderId: messages.senderId,
        conversationId: messages.conversationId,
        readAt: messages.readAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
        conversation: {
          id: conversations.id,
          user1Id: conversations.user1Id,
          user2Id: conversations.user2Id,
          productId: conversations.productId,
          product: sql<any>`(
            select json_build_object(
              'title', p.title,
              'description', p.description,
              'price', p.price,
              'images', p.images,
              'status', p.status,
              'category', json_build_object(
                'displayName', c.display_name,
                'color', c.color,
                'name', c.name
              ),
              'server', json_build_object(
                'displayName', s.display_name,
                'name', s.name
              )
            )
            from ${products} p
            left join ${categories} c on c.id = p.category_id
            left join ${servers} s on s.id = p.server_id
            where p.id = ${conversations.productId}
          )`,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async moderateMessage(id: number, moderatorId: number): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ isModerated: true, moderatorId })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async getPendingMessages(): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        isModerated: messages.isModerated,
        moderatorId: messages.moderatorId,
        senderId: messages.senderId,
        conversationId: messages.conversationId,
        readAt: messages.readAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          username: users.username,
        },
        conversation: {
          id: conversations.id,
          user1Id: conversations.user1Id,
          user2Id: conversations.user2Id,
          productId: conversations.productId,
          product: sql<any>`(
            select json_build_object(
              'id', p.id,
              'title', p.title,
              'description', p.description,
              'price', p.price,
              'images', p.images,
              'status', p.status,
              'category', json_build_object(
                'displayName', c.display_name,
                'color', c.color,
                'name', c.name
              ),
              'server', json_build_object(
                'displayName', s.display_name,
                'name', s.name
              )
            )
            from ${products} p
            left join ${categories} c on c.id = p.category_id
            left join ${servers} s on s.id = p.server_id
            where p.id = ${conversations.productId}
          )`,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(messages.isModerated, false))
      .orderBy(asc(messages.createdAt));
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          ),
          ne(messages.senderId, userId),
          isNull(messages.readAt)
        )
      );
    
    return result[0]?.count || 0;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId),
          isNull(messages.readAt)
        )
      );
  }

  async getConversationsWithUnreadCount(userId: number): Promise<any[]> {
    return await db
      .select({
        id: conversations.id,
        user1Id: conversations.user1Id,
        user2Id: conversations.user2Id,
        productId: conversations.productId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        unreadCount: sql<number>`count(case when ${messages.senderId} != ${userId} and ${messages.readAt} is null then 1 end)`,
        lastMessage: sql<string>`(
          select content 
          from ${messages} m2 
          where m2.conversation_id = ${conversations.id} 
          order by m2.created_at desc 
          limit 1
        )`,
        lastMessageAt: sql<string>`(
          select created_at 
          from ${messages} m2 
          where m2.conversation_id = ${conversations.id} 
          order by m2.created_at desc 
          limit 1
        )`,
        user1: sql<any>`(
          select json_build_object(
            'firstName', u1.first_name,
            'lastName', u1.last_name,
            'profileImageUrl', u1.profile_image_url,
            'username', u1.username
          )
          from ${users} u1
          where u1.id = ${conversations.user1Id}
        )`,
        user2: sql<any>`(
          select json_build_object(
            'firstName', u2.first_name,
            'lastName', u2.last_name,
            'profileImageUrl', u2.profile_image_url,
            'username', u2.username
          )
          from ${users} u2
          where u2.id = ${conversations.user2Id}
        )`,
        product: sql<any>`(
          select json_build_object(
            'title', p.title,
            'description', p.description,
            'price', p.price,
            'images', p.images,
            'status', p.status,
            'category', json_build_object(
              'displayName', c.display_name,
              'color', c.color,
              'name', c.name
            ),
            'server', json_build_object(
              'displayName', s.display_name,
              'name', s.name
            )
          )
          from ${products} p
          left join ${categories} c on c.id = p.category_id
          left join ${servers} s on s.id = p.server_id
          where p.id = ${conversations.productId}
        )`,
      })
      .from(conversations)
      .leftJoin(messages, eq(messages.conversationId, conversations.id))
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)))
      .groupBy(conversations.id)
      .orderBy(desc(conversations.updatedAt));
  }
}

export const storage = new DatabaseStorage();
