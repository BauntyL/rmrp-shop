import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Eye, MessageSquare, BarChart3, CheckCircle, XCircle, Ban, Edit, Shield,
  DollarSign, Calendar, TrendingUp, UserPlus, AlertTriangle, Search, Filter,
  ArrowUpRight, ArrowDownRight, Activity, Package, ShoppingCart, Loader2
} from "lucide-react";
import { motion, type Variants, type AnimationProps } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: "admin" | "moderator" | "user";
  isBanned: boolean;
  banReason?: string;
  createdAt: string;
  lastLoginAt: string;
  profileImageUrl?: string;
  productsCount: number;
  messagesCount: number;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  category: {
    id: number;
    name: string;
    displayName: string;
  };
  server: {
    id: number;
    name: string;
    displayName: string;
  };
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  isModerated: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  conversation: {
    id: number;
    product?: Product;
  };
}

interface Analytics {
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
    byCategory: {
      [key: string]: number;
    };
    byServer: {
      [key: string]: number;
    };
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

interface Category {
  id: number;
  name: string;
  displayName: string;
  color?: string;
}

interface Server {
  id: number;
  name: string;
  displayName: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const floatingAnimation: AnimationProps["animate"] = {
  y: [-4, 4],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }
};

const glowingAnimation: AnimationProps["animate"] = {
  opacity: [0.5, 1, 0.5],
  scale: [0.98, 1, 0.98],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }
};

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productServerFilter, setProductServerFilter] = useState("all");
  const [analyticsRange, setAnalyticsRange] = useState("week");

  // Check if user has admin/moderator permissions
  const hasPermission = user?.role === "admin" || user?.role === "moderator";

  // Users query with filters
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", { search: userSearch, role: userRoleFilter, status: userStatusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(userSearch && { search: userSearch }),
        ...(userRoleFilter !== "all" && { role: userRoleFilter }),
        ...(userStatusFilter !== "all" && { status: userStatusFilter }),
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: isAuthenticated && hasPermission,
  });

  // Products queries
  const { data: pendingProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products/pending", { category: productCategoryFilter, server: productServerFilter }],
    enabled: isAuthenticated && hasPermission,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    enabled: isAuthenticated && hasPermission,
  });

  // Messages queries
  const { data: pendingMessages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/admin/messages/pending"],
    enabled: isAuthenticated && hasPermission,
  });

  const { data: allMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/admin/messages"],
    enabled: isAuthenticated && hasPermission,
  });

  // Analytics query
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics", { range: analyticsRange }],
    enabled: isAuthenticated && hasPermission,
  });

  // Categories and servers queries
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated && hasPermission,
  });

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    enabled: isAuthenticated && hasPermission,
  });

  // User mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно изменена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/ban`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь успешно заблокирован",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось заблокировать пользователя",
        variant: "destructive",
      });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}/unban`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь успешно разблокирован",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать пользователя",
        variant: "destructive",
      });
    },
  });

  // Product mutations
  const updateProductStatusMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      status, 
      note 
    }: { 
      productId: number; 
      status: string; 
      note?: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/admin/products/${productId}/status`, { 
        status, 
        note 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Статус обновлен",
        description: "Статус объявления успешно изменен",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус объявления",
        variant: "destructive",
      });
    },
  });

  // Message mutations
  const moderateMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest("PATCH", `/api/admin/messages/${messageId}/moderate`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Сообщение промодерировано",
        description: "Сообщение помечено как проверенное",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось промодерировать сообщение",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const handleBanUser = (userId: number) => {
    const reason = prompt("Введите причину блокировки:");
    if (reason) {
      banUserMutation.mutate({ userId, reason });
    }
  };

  const handleApproveProduct = (productId: number) => {
    updateProductStatusMutation.mutate({ productId, status: "approved" });
  };

  const handleRejectProduct = (productId: number) => {
    const note = prompt("Введите причину отклонения:");
    if (note) {
      updateProductStatusMutation.mutate({ productId, status: "rejected", note });
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      case "moderator": return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
      default: return "bg-gradient-to-r from-slate-600 to-slate-700 text-white";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Администратор";
      case "moderator": return "Модератор";
      default: return "Пользователь";
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900/20 to-slate-900">
        <Header />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-4">Доступ запрещен</h1>
          <p className="text-slate-300">У вас нет прав для просмотра этой страницы</p>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900/20 to-slate-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-indigo-400" />
              Панель администратора
            </h1>
            <p className="text-slate-300 text-lg">
              Управление пользователями, модерация контента и аналитика
            </p>
          </motion.div>

          {/* Overview Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-indigo-400" />
                    <Badge className={getRoleBadgeColor("admin")}>
                      {analytics?.users.newToday} новых
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-1">
                    {analytics?.users.total}
                  </CardTitle>
                  <p className="text-slate-400">Пользователей</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Package className="h-8 w-8 text-emerald-400" />
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                      {analytics?.products.pending} на модерации
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-1">
                    {analytics?.products.total}
                  </CardTitle>
                  <p className="text-slate-400">Объявлений</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-400" />
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      {analytics?.messages.pending} непроверенных
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white mb-1">
                    {analytics?.messages.total}
                  </CardTitle>
                  <p className="text-slate-400">Сообщений</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-8 w-8 text-rose-400" />
                    <Select value={analyticsRange} onValueChange={setAnalyticsRange}>
                      <SelectTrigger className="w-[100px] bg-slate-700/50 border-slate-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="day">День</SelectItem>
                        <SelectItem value="week">Неделя</SelectItem>
                        <SelectItem value="month">Месяц</SelectItem>
                        <SelectItem value="year">Год</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-2xl font-bold text-white">
                      +{analytics?.users.newThisWeek}%
                    </CardTitle>
                    <span className="text-emerald-400 flex items-center">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-slate-400">Рост пользователей</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
              <TabsTrigger value="users" className="data-[state=active]:bg-indigo-500">
                <Users className="h-4 w-4 mr-2" />
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="moderation" className="data-[state=active]:bg-amber-500">
                <Eye className="h-4 w-4 mr-2" />
                Модерация
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-blue-500">
                <MessageSquare className="h-4 w-4 mr-2" />
                Сообщения
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-500">
                <BarChart3 className="h-4 w-4 mr-2" />
                Аналитика
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                      <Users className="h-6 w-6 text-indigo-400" />
                      Управление пользователями
                    </CardTitle>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          placeholder="Поиск пользователей..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                        />
                      </div>
                      <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600/50">
                          <SelectValue placeholder="Фильтр по роли" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все роли</SelectItem>
                          <SelectItem value="admin">Администраторы</SelectItem>
                          <SelectItem value="moderator">Модераторы</SelectItem>
                          <SelectItem value="user">Пользователи</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600/50">
                          <SelectValue placeholder="Фильтр по статусу" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="active">Активные</SelectItem>
                          <SelectItem value="banned">Заблокированные</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <UserPlus className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Пользователи не найдены</p>
                    </div>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300">Пользователь</TableHead>
                            <TableHead className="text-slate-300">Роль</TableHead>
                            <TableHead className="text-slate-300">Статус</TableHead>
                            <TableHead className="text-slate-300">Объявления</TableHead>
                            <TableHead className="text-slate-300">Сообщения</TableHead>
                            <TableHead className="text-slate-300">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} className="border-slate-700">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={user.profileImageUrl || undefined} />
                                    <AvatarFallback className="bg-slate-700 text-white">
                                      {getUserInitials(user.firstName, user.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-white">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                    <p className="text-xs text-slate-500">@{user.username}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {getRoleText(user.role)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.isBanned ? (
                                  <Badge variant="destructive" className="bg-red-500/80 text-white flex items-center gap-1">
                                    <Ban className="h-3 w-3" />
                                    Заблокирован
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-emerald-500/80 text-white flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Активен
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-slate-300">{user.productsCount}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-slate-300">{user.messagesCount}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {user.role !== "admin" && (
                                    <Select
                                      value={user.role}
                                      onValueChange={(newRole) => 
                                        updateUserRoleMutation.mutate({ userId: user.id, role: newRole })
                                      }
                                    >
                                      <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600/50">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">Пользователь</SelectItem>
                                        <SelectItem value="moderator">Модератор</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {user.isBanned ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => unbanUserMutation.mutate(user.id)}
                                      className="border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Разблокировать
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleBanUser(user.id)}
                                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                      <Ban className="h-4 w-4 mr-1" />
                                      Заблокировать
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation">
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-bold text-white">
                      Модерация объявлений
                    </CardTitle>
                    <div className="flex gap-4">
                      <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600/50">
                          <SelectValue placeholder="Все категории" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all">Все категории</SelectItem>
                          {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={productServerFilter} onValueChange={setProductServerFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600/50">
                          <SelectValue placeholder="Все серверы" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="all">Все серверы</SelectItem>
                          {servers.map((server: Server) => (
                            <SelectItem key={server.id} value={server.id.toString()}>
                              {server.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProducts.map((product) => (
                      <Card key={product.id} className="bg-slate-700/50 border-slate-600/50">
                        <CardContent className="p-6">
                          <div className="aspect-video rounded-lg overflow-hidden mb-4">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                <Package className="h-12 w-12 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{product.title}</h3>
                          <p className="text-slate-300 text-sm mb-4">{product.description}</p>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-slate-500/20 text-slate-300">
                              {product.category.displayName}
                            </Badge>
                            <Badge variant="outline">
                              {product.server.displayName}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={product.user.profileImageUrl} />
                              <AvatarFallback>
                                {getUserInitials(product.user.firstName, product.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {product.user.firstName} {product.user.lastName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproveProduct(product.id)}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Одобрить
                            </Button>
                            <Button
                              onClick={() => handleRejectProduct(product.id)}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Отклонить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">
                    Модерация сообщений
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : pendingMessages.length === 0 ? (
                      <div className="text-center p-8">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-300">Нет сообщений для модерации</p>
                      </div>
                    ) : (
                      pendingMessages.map((message) => (
                        <Card key={message.id} className="bg-slate-700/50 border-slate-600/50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Avatar>
                                <AvatarImage src={message.user?.profileImageUrl} />
                                <AvatarFallback>
                                  {getUserInitials(message.user?.firstName || '', message.user?.lastName || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-white">
                                  {message.user?.firstName} {message.user?.lastName}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {new Date(message.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-slate-300 mb-4">{message.content}</p>
                            {message.conversation?.product && (
                              <div className="flex items-center gap-2 mb-4">
                                <Package className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-400">
                                  В обсуждении объявления "{message.conversation.product.title}"
                                </span>
                              </div>
                            )}
                            <Button
                              onClick={() => moderateMessageMutation.mutate(message.id)}
                              className="w-full bg-blue-500 hover:bg-blue-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Пометить как проверенное
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">
                      Активность
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.activity && analytics.activity.dates && analytics.activity.newUsers && analytics.activity.newProducts && analytics.activity.newMessages && (
                      <Line
                        data={{
                          labels: analytics.activity.dates,
                          datasets: [
                            {
                              label: "Новые пользователи",
                              data: analytics.activity.newUsers,
                              borderColor: "rgb(99, 102, 241)",
                              backgroundColor: "rgba(99, 102, 241, 0.1)",
                              fill: true,
                            },
                            {
                              label: "Новые объявления",
                              data: analytics.activity.newProducts,
                              borderColor: "rgb(16, 185, 129)",
                              backgroundColor: "rgba(16, 185, 129, 0.1)",
                              fill: true,
                            },
                            {
                              label: "Новые сообщения",
                              data: analytics.activity.newMessages,
                              borderColor: "rgb(59, 130, 246)",
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top" as const,
                              labels: {
                                color: "rgb(148, 163, 184)",
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                color: "rgba(148, 163, 184, 0.1)",
                              },
                              ticks: {
                                color: "rgb(148, 163, 184)",
                              },
                            },
                            y: {
                              grid: {
                                color: "rgba(148, 163, 184, 0.1)",
                              },
                              ticks: {
                                color: "rgb(148, 163, 184)",
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Distribution Charts */}
                <div className="space-y-6">
                  <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white">
                        Распределение ролей
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics?.users?.roleDistribution && (
                        <Bar
                          data={{
                            labels: ["Администраторы", "Модераторы", "Пользователи"],
                            datasets: [
                              {
                                data: [
                                  analytics.users.roleDistribution.admin || 0,
                                  analytics.users.roleDistribution.moderator || 0,
                                  analytics.users.roleDistribution.user || 0,
                                ],
                                backgroundColor: [
                                  "rgba(239, 68, 68, 0.8)",
                                  "rgba(59, 130, 246, 0.8)",
                                  "rgba(148, 163, 184, 0.8)",
                                ],
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            scales: {
                              x: {
                                grid: {
                                  display: false,
                                },
                                ticks: {
                                  color: "rgb(148, 163, 184)",
                                },
                              },
                              y: {
                                grid: {
                                  color: "rgba(148, 163, 184, 0.1)",
                                },
                                ticks: {
                                  color: "rgb(148, 163, 184)",
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white">
                        Объявления по категориям
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics?.products?.byCategory && Object.keys(analytics.products.byCategory).length > 0 && (
                        <Bar
                          data={{
                            labels: Object.keys(analytics.products.byCategory).map(
                              (key) => categories?.find((c: Category) => c.name === key)?.displayName || key
                            ),
                            datasets: [
                              {
                                data: Object.values(analytics.products.byCategory).map(value => value || 0),
                                backgroundColor: Object.keys(analytics.products.byCategory).map(
                                  (key) => {
                                    const category = categories?.find((c: Category) => c.name === key);
                                    return `rgba(${category?.color || "148, 163, 184"}, 0.8)`;
                                  }
                                ),
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            scales: {
                              x: {
                                grid: {
                                  display: false,
                                },
                                ticks: {
                                  color: "rgb(148, 163, 184)",
                                },
                              },
                              y: {
                                grid: {
                                  color: "rgba(148, 163, 184, 0.1)",
                                },
                                ticks: {
                                  color: "rgb(148, 163, 184)",
                                },
                              },
                            },
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
