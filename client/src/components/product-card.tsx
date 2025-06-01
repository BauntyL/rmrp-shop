import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Copy, Phone, Star, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithDetails } from "@/lib/types";

interface ProductCardProps {
  product: ProductWithDetails;
  onContact?: (userId: number) => void;
}

export default function ProductCard({ product, onContact }: ProductCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      cyan: "bg-cyan-100 text-cyan-600",
      purple: "bg-purple-100 text-purple-600",
    };
    return colorMap[color] || "bg-gray-100 text-gray-600";
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
  const imageUrl = product.images?.[0] || defaultImage;
  const metadata = product.metadata || {};
  const contacts = metadata.contacts || {};

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg h-80">
      <div className="flex h-full">
        {/* Левая часть - изображение */}
        <div className="relative w-2/5 overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
          
          {/* Image with loading effect */}
          <div className="relative h-full bg-gray-200 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
            )}
            <img 
              src={imageUrl} 
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultImage;
                setImageLoaded(true);
              }}
            />
          </div>
          
          {/* Floating favorite button */}
          <div className="absolute top-3 right-3 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              disabled={toggleFavoriteMutation.isPending}
              className={`p-2 rounded-full backdrop-blur-sm bg-white/90 hover:bg-white transition-all duration-200 shadow-lg border-0 ${
                isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""} transition-all duration-200`} />
            </Button>
          </div>
        </div>
        
        {/* Правая часть - контент */}
        <div className="w-3/5 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Header with badge and price */}
              <div className="flex items-start justify-between">
                <Badge className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  product.category?.color === 'blue' ? 'bg-blue-500 text-white' :
                  product.category?.color === 'green' ? 'bg-green-500 text-white' :
                  product.category?.color === 'cyan' ? 'bg-cyan-500 text-white' :
                  product.category?.color === 'purple' ? 'bg-purple-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {product.category?.displayName}
                </Badge>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {formatPrice(product.price)}
                </div>
              </div>
              
              <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
                {product.title}
              </h3>
              
              {/* Car specific info - compact version */}
              {product.categoryId === 1 && metadata && (
                <div className="space-y-1 text-xs text-gray-600">
                  {metadata.category && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>{getCategoryLabel(metadata.category)}</span>
                    </div>
                  )}
                  {metadata.maxSpeed && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>{metadata.maxSpeed} км/ч</span>
                    </div>
                  )}
                  {metadata.tuning && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <span>{getTuningLabel(metadata.tuning)}</span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
            
            {/* Bottom section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{product.server?.displayName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              {/* Contact info - compact */}
              {product.categoryId === 1 && contacts && Object.keys(contacts).some(key => contacts[key]) && (
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {contacts.discord && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contacts.discord, 'Discord')}
                        className="text-xs h-6 px-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      >
                        <Copy className="h-2.5 w-2.5 mr-1" />
                        Discord
                      </Button>
                    )}
                    {contacts.telegram && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTelegram(contacts.telegram)}
                        className="text-xs h-6 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        TG
                      </Button>
                    )}
                    {contacts.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(contacts.phone, 'Телефон')}
                        className="text-xs h-6 px-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Phone className="h-2.5 w-2.5 mr-1" />
                        Тел
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-1.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs" 
                onClick={handleContactSeller}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Написать
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
