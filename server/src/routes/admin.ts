import { Router } from "express";
import { prisma } from "../prisma";
import { isAuthenticated } from "../middleware/auth";
import { isAdmin } from "../middleware/admin";

const router = Router();

// Защита всех маршрутов
router.use(isAuthenticated, isAdmin);

// Получение списка пользователей с фильтрами
router.get("/users", async (req, res) => {
  const { search, role, status } = req.query;
  console.log('Query params:', { search, role, status });

  const where: any = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: "insensitive" } },
      { lastName: { contains: search as string, mode: "insensitive" } },
      { email: { contains: search as string, mode: "insensitive" } },
      { username: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (role && role !== "all") {
    where.role = role;
  }

  if (status === "banned") {
    where.isBanned = true;
  } else if (status === "active") {
    where.isBanned = false;
  }

  console.log('Prisma where clause:', where);

  try {
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        lastLoginAt: true,
        profileImageUrl: true,
        _count: {
          select: {
            products: true,
            messages: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log('Found users:', users.length);

    const response = users.map(user => ({
      ...user,
      productsCount: user._count.products,
      messagesCount: user._count.messages,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Обновление роли пользователя
router.patch("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "moderator", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { role },
  });

  res.json(user);
});

// Блокировка пользователя
router.patch("/users/:id/ban", async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      isBanned: true,
      banReason: reason,
    },
  });

  res.json(user);
});

// Разблокировка пользователя
router.patch("/users/:id/unban", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      isBanned: false,
      banReason: null,
    },
  });

  res.json(user);
});

// Получение объявлений на модерации
router.get("/products/pending", async (req, res) => {
  const { category, server } = req.query;

  const where: any = {
    status: "pending",
  };

  if (category && category !== "all") {
    where.categoryId = parseInt(category as string);
  }

  if (server && server !== "all") {
    where.serverId = parseInt(server as string);
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
      category: true,
      server: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
});

// Обновление статуса объявления
router.patch("/products/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      status,
      moderationNote: note,
    },
  });

  res.json(product);
});

// Получение сообщений на модерации
router.get("/messages/pending", async (req, res) => {
  try {
    console.log('🔍 Fetching pending messages...');
    
    // Сначала получим только сообщения без связей для проверки
    const baseMessages = await prisma.message.findMany({
      where: {
        isModerated: false,
      },
      select: {
        id: true,
      },
    });
    
    console.log(`📝 Found ${baseMessages.length} base messages`);

    // Теперь получим полные данные
    const messages = await prisma.message.findMany({
      where: {
        isModerated: false,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        isModerated: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            username: true,
          },
        },
        conversation: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
                server: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    console.log('📊 Full messages data structure:', JSON.stringify(messages[0], null, 2));

    // Преобразуем данные для безопасной обработки null значений
    const safeMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      isModerated: message.isModerated,
      user: message.user || null,
      conversation: message.conversation ? {
        id: message.conversation.id,
        product: message.conversation.product || null,
      } : null,
    }));

    console.log('✅ Transformed messages:', JSON.stringify(safeMessages[0], null, 2));

    res.json(safeMessages);
  } catch (error) {
    console.error('❌ Error in /messages/pending:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pending messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Модерация сообщения
router.patch("/messages/:id/moderate", async (req, res) => {
  const { id } = req.params;

  const message = await prisma.message.update({
    where: { id: parseInt(id) },
    data: {
      isModerated: true,
    },
  });

  res.json(message);
});

// Получение аналитики
router.get("/analytics", async (req, res) => {
  const { range = "week" } = req.query;

  let daysToSubtract = 7;
  if (range === "month") daysToSubtract = 30;
  else if (range === "year") daysToSubtract = 365;
  else if (range === "day") daysToSubtract = 1;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToSubtract);

  // Общая статистика
  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    adminCount,
    moderatorCount,
    userCount,
    totalProducts,
    pendingProducts,
    approvedProducts,
    rejectedProducts,
    newProductsToday,
    totalMessages,
    pendingMessages,
    moderatedMessages,
    newMessagesToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: false } }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "moderator" } }),
    prisma.user.count({ where: { role: "user" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "pending" } }),
    prisma.product.count({ where: { status: "approved" } }),
    prisma.product.count({ where: { status: "rejected" } }),
    prisma.product.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.message.count(),
    prisma.message.count({ where: { isModerated: false } }),
    prisma.message.count({ where: { isModerated: true } }),
    prisma.message.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  // Статистика по категориям
  const productsByCategory = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: true,
  });

  const categories = await prisma.category.findMany();
  const productsByCategoryMap = Object.fromEntries(
    categories.map(category => [
      category.name,
      productsByCategory.find(p => p.categoryId === category.id)?._count || 0,
    ])
  );

  // Статистика по серверам
  const productsByServer = await prisma.product.groupBy({
    by: ["serverId"],
    _count: true,
  });

  const servers = await prisma.server.findMany();
  const productsByServerMap = Object.fromEntries(
    servers.map(server => [
      server.name,
      productsByServer.find(p => p.serverId === server.id)?._count || 0,
    ])
  );

  // График активности
  const dates = [];
  const newUsers = [];
  const newProducts = [];
  const newMessages = [];

  for (let i = daysToSubtract; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    dates.push(date.toLocaleDateString());

    const [usersCount, productsCount, messagesCount] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      prisma.product.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      prisma.message.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    newUsers.push(usersCount);
    newProducts.push(productsCount);
    newMessages.push(messagesCount);
  }

  res.json({
    users: {
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
      newToday: newUsersToday,
      newThisWeek: newUsersThisWeek,
      newThisMonth: newUsersThisMonth,
      roleDistribution: {
        admin: adminCount,
        moderator: moderatorCount,
        user: userCount,
      },
    },
    products: {
      total: totalProducts,
      pending: pendingProducts,
      approved: approvedProducts,
      rejected: rejectedProducts,
      newToday: newProductsToday,
      byCategory: productsByCategoryMap,
      byServer: productsByServerMap,
    },
    messages: {
      total: totalMessages,
      pending: pendingMessages,
      moderated: moderatedMessages,
      newToday: newMessagesToday,
    },
    activity: {
      dates,
      newUsers,
      newProducts,
      newMessages,
    },
  });
});

export default router; 