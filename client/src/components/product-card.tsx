import { useState } from "react";
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
  const [newPrice, setNewPrice] = useState(product.price);

  // Добавляем определения прав доступа
  const canManage = user && (user.role === 'admin' || user.role === 'moderator' || user.id === product.userId);
  const canEdit = user && (user.role === 'admin' || user.role === 'moderator' || user.id === product.userId);
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

  // Добавляем обработчики
  const handleUpdatePrice = () => {
    if (newPrice && newPrice > 0) {
      updatePriceMutation.mutate(newPrice);
    }
  };

  const handleDeleteProduct = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProductMutation.mutate();
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
                <div className="flex space-x-2 pt-3 border-t border-gray-200">
                  {canEditPrice && (
                    <Dialog open={isEditPriceOpen} onOpenChange={setIsEditPriceOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Цена
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Изменить цену</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="price">Новая цена (₽)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              min="1"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={handleUpdatePrice}
                              disabled={updatePriceMutation.isPending}
                              className="flex-1"
                            >
                              {updatePriceMutation.isPending ? "Обновление..." : "Обновить"}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditPriceOpen(false)}
                              className="flex-1"
                            >
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        toast({
                          title: "Редактирование",
                          description: "Функция полного редактирования будет добавлена в следующем обновлении",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Редактировать
                    </Button>
                  )}
                  
                  {canManage && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      onClick={handleDeleteProduct}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </div>
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
              
              {/* Контактная информация */}
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
              
              {/* Кнопка связи */}
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
            
            {/* Правая колонка - информация */}
            <div className="space-y-6">
              {/* Основная информация */}
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
              
              {/* Описание */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Описание</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
              
              {/* Характеристики автомобиля */}
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
