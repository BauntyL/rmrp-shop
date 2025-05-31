export interface CategoryWithProducts {
  id: number;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  productCount?: number;
}

export interface ProductWithDetails {
  id: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  serverId: number;
  userId: number;
  images: string[];
  metadata?: any;
  status: string;
  createdAt: string;
  category?: {
    displayName: string;
    color: string;
  };
  server?: {
    displayName: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
  isFavorite?: boolean;
}

export interface ConversationWithDetails {
  id: number;
  user1Id: number;
  user2Id: number;
  productId?: number;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  product?: {
    title: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
}
