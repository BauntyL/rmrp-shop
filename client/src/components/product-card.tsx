import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Copy, Phone } from "lucide-react";
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={product.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(product.category?.color || "gray")}`}>
            {product.category?.displayName}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            disabled={toggleFavoriteMutation.isPending}
            className={`p-1 ${
              isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {product.title}
        </h3>
        
        {/* Информация об автомобиле */}
        {product.categoryId === 1 && metadata && (
          <div className="space-y-1 mb-3 text-sm text-gray-600">
            {metadata.category && (
              <div>Категория: {getCategoryLabel(metadata.category)}</div>
            )}
            {metadata.maxSpeed && (
              <div>Макс. скорость: {metadata.maxSpeed} км/ч</div>
            )}
            {metadata.tuning && (
              <div>Тюнинг: {getTuningLabel(metadata.tuning)}</div>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-gray-500">
            {product.server?.displayName}
          </span>
        </div>
        
        {/* Контактная информация */}
        {product.categoryId === 1 && contacts && Object.keys(contacts).some(key => contacts[key]) && (
          <div className="mb-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Контакты:</h4>
            <div className="flex flex-wrap gap-2">
              {contacts.discord && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(contacts.discord, 'Discord')}
                  className="text-xs h-7 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {contacts.discord}
                </Button>
              )}
              {contacts.telegram && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openTelegram(contacts.telegram)}
                  className="text-xs h-7 px-2"
                >
                  TG: {contacts.telegram}
                </Button>
              )}
              {contacts.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(contacts.phone, 'Телефон')}
                  className="text-xs h-7 px-2"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {contacts.phone}
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={handleContactSeller}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Написать
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
