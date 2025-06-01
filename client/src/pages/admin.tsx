import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, MessageSquare, BarChart3, CheckCircle, XCircle, Ban, Edit, Shield } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has admin/moderator permissions
  const hasPermission = user?.role === "admin" || user?.role === "moderator";

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && hasPermission,
  });

  const { data: pendingProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/products/pending"],
    enabled: isAuthenticated && hasPermission,
  });

  const { data: pendingMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/admin/messages/pending"],
    enabled: isAuthenticated && hasPermission,
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать пользователя",
        variant: "destructive",
      });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/pending"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус объявления",
        variant: "destructive",
      });
    },
  });

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
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось промодерировать сообщение",
        variant: "destructive",
      });
    },
  });

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
      case "admin": return "bg-red-100 text-red-800";
      case "moderator": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Администратор";
      case "moderator": return "Модератор";
      default: return "Пользователь";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Доступ ограничен</h1>
          <p className="text-slate-300 mb-6">Войдите в систему для доступа к панели администратора</p>
          <Button onClick={() => window.location.href = "/login"} className="bg-blue-600 hover:bg-blue-700">
            Войти
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Недостаточно прав</h1>
          <p className="text-slate-300 mb-6">У вас нет прав для доступа к панели администратора</p>
          <Button onClick={() => window.location.href = "/"} className="bg-blue-600 hover:bg-blue-700">
            На главную
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Панель администратора</h1>
          </div>
          <p className="text-slate-300">
            Управление пользователями, модерация контента
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Пользователи</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">На модерации</p>
                  <p className="text-2xl font-bold text-white">{pendingProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Сообщения</p>
                  <p className="text-2xl font-bold text-white">{pendingMessages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Всего товаров</p>
                  <p className="text-2xl font-bold text-white">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Пользователи</TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Модерация</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Сообщения</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Аналитика</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Пользователь</TableHead>
                        <TableHead className="text-slate-300">Роль</TableHead>
                        <TableHead className="text-slate-300">Статус</TableHead>
                        <TableHead className="text-slate-300">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData: any) => (
                        <TableRow key={userData.id} className="border-slate-700">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={userData.profileImageUrl} />
                                <AvatarFallback className="bg-slate-700 text-white">
                                  {getUserInitials(userData.firstName, userData.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {userData.firstName} {userData.lastName}
                                </p>
                                <p className="text-sm text-slate-400">{userData.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={userData.role}
                              onValueChange={(role) => 
                                updateUserRoleMutation.mutate({ userId: userData.id, role })
                              }
                              disabled={userData.id === user?.id}
                            >
                              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="user" className="text-white hover:bg-slate-600">Пользователь</SelectItem>
                                <SelectItem value="moderator" className="text-white hover:bg-slate-600">Модератор</SelectItem>
                                {user?.role === "admin" && (
                                  <SelectItem value="admin" className="text-white hover:bg-slate-600">Администратор</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge className={userData.isBanned ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                              {userData.isBanned ? "Заблокирован" : "Активен"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {userData.id !== user?.id && (
                                <>
                                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {userData.isBanned ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => unbanUserMutation.mutate(userData.id)}
                                      disabled={unbanUserMutation.isPending}
                                      className="text-green-400 hover:text-green-300 border-slate-600 hover:bg-slate-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleBanUser(userData.id)}
                                      disabled={banUserMutation.isPending}
                                      className="text-red-400 hover:text-red-300 border-slate-600 hover:bg-slate-700"
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Moderation */}
          <TabsContent value="moderation">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Модерация объявлений</CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-slate-700 rounded-lg animate-pulse">
                        <div className="w-16 h-16 bg-slate-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Нет объявлений на модерации
                    </h3>
                    <p className="text-slate-300">
                      Все объявления прошли проверку
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-700/50">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                            alt={product.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-white">{product.title}</h4>
                            <p className="text-sm text-slate-300">
                              Автор: {product.user?.firstName} {product.user?.lastName}
                            </p>
                            <p className="text-sm text-slate-400">
                              Категория: {product.category?.displayName}
                            </p>
                            <p className="text-sm font-medium text-white">
                              {new Intl.NumberFormat("ru-RU", {
                                style: "currency",
                                currency: "RUB",
                                minimumFractionDigits: 0,
                              }).format(product.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleApproveProduct(product.id)}
                            disabled={updateProductStatusMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Одобрить
                          </Button>
                          <Button
                            onClick={() => handleRejectProduct(product.id)}
                            disabled={updateProductStatusMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message Moderation */}
          <TabsContent value="messages">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Модерация сообщений</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border border-slate-700 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                        </div>
                        <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Нет сообщений на модерации
                    </h3>
                    <p className="text-slate-300">
                      Все сообщения прошли проверку
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingMessages.map((message: any) => (
                      <div key={message.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-700/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-slate-600 text-white">
                                {getUserInitials(message.sender?.firstName, message.sender?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-white">
                              {message.sender?.firstName} {message.sender?.lastName}
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(message.createdAt).toLocaleString("ru-RU")}
                            </span>
                          </div>
                          <p className="text-slate-200">{message.content}</p>
                        </div>
                        <Button
                          onClick={() => moderateMessageMutation.mutate(message.id)}
                          disabled={moderateMessageMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Одобрить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Аналитика в разработке
                  </h3>
                  <p className="text-slate-300">
                    Статистика и аналитика будут доступны в ближайшем обновлении
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
