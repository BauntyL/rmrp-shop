import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Copy, Phone, Star, Eye, Info, Send, MessageSquare, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithDetails } from "@/lib/types";
import { Check, X, Settings, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  product: ProductWithDetails;
  onContact?: (userId: number) => void;
  showManageButtons?: boolean; // Новый пропс для показа кнопок управления
}

export default function ProductCard({ product, onContact, showManageButtons = false }: ProductCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditPriceOpen, setIsEditPriceOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(product.price);
  
  // Добавляем useEffect для синхронизации newPrice с product.price
  useEffect(() => {
    setNewPrice(product.price);
  }, [product.price]);
  
  // Добавляем состояние для формы редактирования
  const [editForm, setEditForm] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
  });

  // Добавляем определения прав доступа
  const canManage = user && (user.role === 'admin' || user.role === 'moderator' || user.id === product.userId);
  const canEdit = user && (user.role === 'admin' || user.role === 'moderator'); // Убираем владельца товара
  const canEditPrice = user && (user.role === 'admin' || user.role === 'moderator' || user.id === product.userId);

  // Добавляем мутацию для обновления цены
  const updatePriceMutation = useMutation({
    mutationFn: async (newPrice: number) => {
      await apiRequest("PUT", `/api/products/${product.id}/price`, { price: newPrice });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      setIsEditPriceOpen(false);
      toast({
        title: "Успешно",
        description: "Цена товара обновлена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить цену товара",
        variant: "destructive",
      });
    },
  });

  // Добавляем мутацию для удаления товара
  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      setIsDeleteConfirmOpen(false);
      toast({
        title: "Успешно",
        description: "Товар удален",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
    },
  });

  // Добавляем мутацию для редактирования товара
  const editProductMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/products/${product.id}`, {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
      setIsEditProductOpen(false);
      toast({
        title: "Успешно",
        description: "Товар обновлен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар",
        variant: "destructive",
      });
    },
  });

  // Добавляем обработчики
  const handleUpdatePrice = () => {
    if (newPrice && newPrice > 0 && newPrice !== product.price) {
      updatePriceMutation.mutate(newPrice);
    }
  };

  const handleDeleteProduct = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Добавляем функцию для подтверждения удаления
  const handleConfirmDelete = () => {
    deleteProductMutation.mutate();
  };

  const handleEditProduct = () => {
    if (editForm.title && editForm.price > 0) {
      editProductMutation.mutate();
    }
  };

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${product.id}`);
      } else {
        await apiRequest("POST", `/api/favorites/${product.id}`);
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
        description: isFavorite 
          ? "Товар удален из избранного" 
          : "Товар добавлен в избранное",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для добавления в избранное",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему для связи с продавцом",
        variant: "destructive",
      });
      return;
    }
    
    if (user?.id === product.userId) {
      toast({
        title: "Это ваш товар",
        description: "Вы не можете связаться с самим собой",
        variant: "destructive",
      });
      return;
    }

    onContact?.(product.userId);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Скопировано",
        description: `${type} скопирован в буфер обмена`,
      });
    }).catch(() => {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать",
        variant: "destructive",
      });
    });
  };

  const openTelegram = (username: string) => {
    const cleanUsername = username.replace('@', '');
    window.open(`https://t.me/${cleanUsername}`, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      standard: "Стандарт",
      coupe: "Купе",
      suv: "Внедорожники",
      sport: "Спорт",
      motorcycle: "Мотоциклы",
      special: "Специальные",
    };
    return categories[category] || category;
  };

  const getTuningLabel = (tuning: string) => {
    const tunings: Record<string, string> = {
      none: "Без тюнинга",
      ft: "FT",
      fft: "FFT",
    };
    return tunings[tuning] || tuning;
  };

  const defaultImage = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : defaultImage;
  const metadata = product.metadata || {};
  const contacts = metadata.contacts || {};

  return (
    <>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 rounded-2xl shadow-lg">
        {/* Основная карточка */}
        <div className="relative">
          {/* Изображение */}
          <div className="relative h-56 overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
            
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
            )}
            
            <img 
              src={imageUrl} 
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== defaultImage) {
                  target.src = defaultImage;
                }
                setImageLoaded(true);
              }}
            />
            
            {/* Кнопка избранного */}
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                disabled={toggleFavoriteMutation.isPending}
                className={`p-3 rounded-full backdrop-blur-md bg-white/90 hover:bg-white transition-all duration-300 shadow-xl border-0 ${
                  isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""} transition-all duration-300`} />
              </Button>
            </div>
            
            {/* Цена */}
            <div className="absolute bottom-4 left-4 z-20">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-2xl backdrop-blur-sm">
                {formatPrice(product.price)}
              </div>
            </div>
            
            {/* Категория */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className={`text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm ${
                product.category?.color === 'blue' ? 'bg-blue-500/90 text-white' :
                product.category?.color === 'green' ? 'bg-green-500/90 text-white' :
                product.category?.color === 'cyan' ? 'bg-cyan-500/90 text-white' :
                product.category?.color === 'purple' ? 'bg-purple-500/90 text-white' :
                'bg-gray-500/90 text-white'
              }`}>
                {product.category?.displayName || 'Без категории'}
                </Badge>
            </div>
          </div>
        </div>
          
          {/* Контент */}
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Заголовок */}
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                  {product.title}
                </h3>
                
                {/* Сервер */}
                <div className="flex items-center space-x-2 text-gray-700">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-lg">{product.server?.displayName || 'Неизвестный сервер'}</span>
                </div>
              </div>
              
              {/* Краткое описание */}
              <p className="text-gray-600 line-clamp-2 leading-relaxed text-base">
                {product.description}
              </p>
              
              {/* Кнопки действий */}
              <div className="flex space-x-3 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                  onClick={handleContactSeller}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Написать
                </Button>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="px-4 py-3 border-2 border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 text-blue-700 transition-all duration-300 rounded-xl font-semibold text-sm"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
                </div>

              {/* Кнопки управления для владельца/модератора/админа */}
              {(showManageButtons || canManage) && (
                <div className="flex justify-center space-x-3 pt-4 border-t border-gray-100">
                  {canEditPrice && (
                    <Dialog open={isEditPriceOpen} onOpenChange={setIsEditPriceOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-10 h-10 p-0 rounded-full border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 text-emerald-600 hover:text-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="Изменить цену"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                        <DialogHeader className="text-center pb-4">
                          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Edit className="h-8 w-8 text-emerald-600" />
                          </div>
                          <DialogTitle className="text-2xl font-bold text-emerald-800">
                            Изменить цену
                          </DialogTitle>
                          <p className="text-emerald-700 mt-2">
                            Установите новую цену для товара
                          </p>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-emerald-800 font-semibold">
                              Новая цена (₽)
                            </Label>
                            <div className="relative">
                              <Input
                                id="price"
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(Number(e.target.value))}
                                min="1"
                                className="pl-8 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                                placeholder="Введите цену"
                              />
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-700 font-semibold">
                                ₽
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              onClick={handleUpdatePrice}
                              disabled={updatePriceMutation.isPending}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                              {updatePriceMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Обновление...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Обновить
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditPriceOpen(false)}
                              className="flex-1 border-gray-400 text-gray-800 hover:bg-gray-100 hover:text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {canEdit && (
                    <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-10 h-10 p-0 rounded-full border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-600 hover:text-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="Редактировать товар"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="text-center pb-4">
                          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Edit className="h-8 w-8 text-blue-600" />
                          </div>
                          <DialogTitle className="text-2xl font-bold text-blue-800">
                            Редактировать товар
                          </DialogTitle>
                          <p className="text-blue-700 mt-2">
                            Измените информацию о товаре
                          </p>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title" className="text-blue-800 font-semibold">
                                Название товара
                              </Label>
                              <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                placeholder="Введите название"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-price" className="text-blue-800 font-semibold">
                                Цена (₽)
                              </Label>
                              <Input
                                id="edit-price"
                                type="number"
                                value={editForm.price}
                                onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                min="1"
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                placeholder="Введите цену"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-blue-800 font-semibold">
                              Описание
                            </Label>
                            <textarea
                              id="edit-description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              className="w-full min-h-[100px] p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-none"
                              placeholder="Введите описание товара"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              onClick={handleEditProduct}
                              disabled={editProductMutation.isPending}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                              {editProductMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Сохранение...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Сохранить
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setIsEditProductOpen(false);
                                setEditForm({
                                  title: product.title,
                                  description: product.description,
                                  price: product.price,
                                  categoryId: product.categoryId,
                                  serverId: product.serverId
                                });
                              }}
                              className="flex-1 border-gray-400 text-gray-800 hover:bg-gray-100 hover:text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {canManage && (
                    <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-10 h-10 p-0 rounded-full border-2 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 text-red-600 hover:text-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          title="Удалить товар"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                        <DialogHeader className="text-center pb-4">
                          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="h-8 w-8 text-red-600" />
                          </div>
                          <DialogTitle className="text-2xl font-bold text-red-800">
                            Удалить товар
                          </DialogTitle>
                          <p className="text-red-700 mt-2">
                            Это действие нельзя отменить
                          </p>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="bg-red-100 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-red-800 mb-1">
                                  Внимание!
                                </h3>
                                <p className="text-red-800 text-sm">
                                  Вы собираетесь удалить товар "{product.title}". Это действие необратимо и все данные о товаре будут потеряны.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsDeleteConfirmOpen(false)}
                              className="flex-1 border-gray-400 text-gray-800 hover:bg-gray-100 hover:text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Отмена
                            </Button>
                            <Button 
                              onClick={handleConfirmDelete}
                              disabled={deleteProductMutation.isPending}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                              {deleteProductMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Удаление...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Удалить
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
              </div>
              </CardContent>
        </Card>

        {/* Модальное окно */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
              {product.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - изображение и контакты */}
            <div className="space-y-4">
              <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={imageUrl} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== defaultImage) {
                      target.src = defaultImage;
                    }
                  }}
                />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 py-2 rounded-full text-xl font-bold shadow-xl">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>
              
              {/* Дополнительные изображения */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {product.images.slice(1, 4).map((img, index) => (
                    <div key={index} className="h-20 rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={img} 
                        alt={`${product.title} ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== defaultImage) {
                            target.src = defaultImage;
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Контактная информация */
              {contacts && Object.keys(contacts).some(key => contacts[key]) && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Контакты продавца</h3>
                  <div className="space-y-3">
                    {contacts.discord && (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 py-3"
                        onClick={() => copyToClipboard(contacts.discord, 'Discord')}
                      >
                        <MessageSquare className="h-5 w-5 mr-3" />
                        Discord: {contacts.discord}
                        <Copy className="h-4 w-4 ml-auto" />
                      </Button>
                    )}
                    {contacts.telegram && (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 py-3"
                        onClick={() => openTelegram(contacts.telegram)}
                      >
                        <Send className="h-5 w-5 mr-3" />
                        Telegram: {contacts.telegram}
                      </Button>
                    )}
                    {contacts.phone && (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100 py-3"
                        onClick={() => copyToClipboard(contacts.phone, 'Телефон')}
                      >
                        <Phone className="h-5 w-5 mr-3" />
                        Телефон: {contacts.phone}
                        <Copy className="h-4 w-4 ml-auto" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Кнопка связи */
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg" 
                onClick={() => {
                  handleContactSeller();
                  setIsModalOpen(false);
                }}
              >
                <MessageCircle className="h-6 w-6 mr-3" />
                Написать продавцу
              </Button>
            </div>
            
            {/* Правая колонка - информация */
            <div className="space-y-6">
              {/* Основная информация */
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Категория:</span>
                    <Badge className={`${
                      product.category?.color === 'blue' ? 'bg-blue-500 text-white' :
                      product.category?.color === 'green' ? 'bg-green-500 text-white' :
                      product.category?.color === 'cyan' ? 'bg-cyan-500 text-white' :
                      product.category?.color === 'purple' ? 'bg-purple-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {product.category?.displayName || 'Без категории'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Сервер:</span>
                    <span className="font-semibold text-gray-900">{product.server?.displayName || 'Неизвестный сервер'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Рейтинг:</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-orange-500 fill-current" />
                      ))}
                      <span className="text-gray-600 ml-2">(5.0)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Описание */
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Описание</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
              
              {/* Характеристики автомобиля */
              {product.categoryId === 1 && metadata && Object.keys(metadata).length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Характеристики</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {metadata.category && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Категория ТС:</span>
                        <span className="font-semibold text-gray-900">{getCategoryLabel(metadata.category)}</span>
                      </div>
                    )}
                    {metadata.maxSpeed && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Макс. скорость:</span>
                        <span className="font-semibold text-gray-900">{metadata.maxSpeed} км/ч</span>
                      </div>
                    )}
                    {metadata.tuning && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Тюнинг:</span>
                        <span className="font-semibold text-gray-900">{getTuningLabel(metadata.tuning)}</span>
                      </div>
                    )}
                    {metadata.acceleration && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">Разгон 0-100:</span>
                        <span className="font-semibold text-gray-900">{metadata.acceleration}с</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
