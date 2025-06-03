export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string;
  profileImageUrl: string | null;
  role: 'admin' | 'moderator' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  serverId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user?: User;
  category?: {
    id: string;
    name: string;
  };
  server?: {
    id: string;
    name: string;
  };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  isModerated: boolean;
  moderatorId: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User | null;
  conversation?: {
    id: string;
    user1Id: string;
    user2Id: string;
    productId: string;
    createdAt: string;
    updatedAt: string;
    product?: Product;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Server {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  users: {
    total: number;
    active: number;
    banned: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    roleDistribution: {
      admin: number;
      moderator: number;
      user: number;
    };
  };
  products: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    newToday: number;
    byCategory: Record<string, number>;
    byServer: Record<string, number>;
  };
  messages: {
    total: number;
    pending: number;
    moderated: number;
    newToday: number;
  };
  activity: {
    dates: string[];
    newUsers: number[];
    newProducts: number[];
    newMessages: number[];
  };
} 