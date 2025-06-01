import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CreateListingModal from "@/components/create-listing-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

export default function MyProducts() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateListing, setShowCreateListing] = useState(false);
  
  console.log('MyProducts рендерится, showCreateListing:', showCreateListing);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/my-products"],
    enabled: isAuthenticated,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Объявление удалено",
        description: "Ваше объявление было успешно удалено",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-products"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить объявление",
        variant: "destructive",
      });
    },
  });

  // Функция для просмотра товара
  const handleViewProduct = (productId: number) => {
    window.open(`/product/${productId}`, '_blank');
  };

  // Функция для редактирования товара
  const handleEditProduct = (productId: number) => {
    // Здесь можно добавить логику для открытия модального окна редактирования
    // или перенаправления на страницу редактирования
    toast({
      title: "Редактирование",
      description: "Функция редактирования будет добавлена в следующем обновлении",
    });
  };

  // Функция для удаления товара с подтверждением
  const handleDeleteProduct = (productId: number, productTitle: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${productTitle}"?`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Доступ ограничен</h1>
          <p className="text-slate-300 mb-6">Войдите в систему для просмотра ваших товаров</p>
          <Button onClick={() => window.location.href = "/login"} className="bg-blue-600 hover:bg-blue-700">
            Войти
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-600 text-white";
      case "approved": return "bg-green-600 text-white";
      case "rejected": return "bg-red-600 text-white";
      case "sold": return "bg-blue-600 text-white";
      default: return "bg-slate-600 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "На модерации";
      case "approved": return "Одобрено";
      case "rejected": return "Отклонено";
      case "sold": return "Продано";
      default: return status;
    }
  };

  const filterProductsByStatus = (status?: string) => {
    if (!status) return products;
    return products.filter((product: any) => product.status === status);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const pendingProducts = filterProductsByStatus("pending");
  const approvedProducts = filterProductsByStatus("approved");
  const rejectedProducts = filterProductsByStatus("rejected");

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="overflow-hidden bg-slate-800 border-slate-700">
      <div className="relative">
        <img 
          src={product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"}
          alt={product.title}
          className="w-full h-32 object-cover cursor-pointer"
          onClick={() => handleViewProduct(product.id)}
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(product.status)}`}>
          {getStatusText(product.status)}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-1 cursor-pointer hover:text-blue-400" 
            onClick={() => handleViewProduct(product.id)}>
          {product.title}
        </h3>
        <p className="text-sm text-slate-300 mb-2 line-clamp-2">
          {product.description}
        </p>
        <p className="text-lg font-bold text-white mb-3">
          {formatPrice(product.price)}
        </p>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => handleViewProduct(product.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Просмотр
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => handleEditProduct(product.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Редактировать
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-400 hover:text-red-300 border-slate-600 hover:bg-slate-700"
            onClick={() => handleDeleteProduct(product.id, product.title)}
            disabled={deleteProductMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {product.status === "rejected" && product.moderatorNote && (
          <div className="mt-3 p-2 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-sm text-red-200">
              <strong>Причина отклонения:</strong> {product.moderatorNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Мои товары</h1>
            <p className="text-slate-300">Управляйте вашими объявлениями</p>
          </div>
          <Button 
            onClick={() => {
              console.log('Кнопка нажата, showCreateListing:', showCreateListing);
              setShowCreateListing(true);
              console.log('setShowCreateListing(true) вызван');
            }} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
              Все ({products.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
              На модерации ({pendingProducts.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
              Одобренные ({approvedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
              Отклоненные ({rejectedProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-4 animate-pulse">
                    <div className="bg-slate-700 rounded-lg h-32 mb-4"></div>
                    <div className="bg-slate-700 rounded h-4 mb-2"></div>
                    <div className="bg-slate-700 rounded h-3 mb-4"></div>
                    <div className="bg-slate-700 rounded h-6"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Plus className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  У вас еще нет товаров
                </h3>
                <p className="text-slate-300 mb-6">
                  Создайте ваше первое объявление
                </p>
                <Button onClick={() => setShowCreateListing(true)} className="bg-blue-600 hover:bg-blue-700">
                  Создать первое объявление
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    showManageButtons={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-yellow-600/20 mb-4">
                  <Eye className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Нет товаров на модерации
                </h3>
                <p className="text-slate-300">
                  Все ваши товары прошли модерацию
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-green-600/20 mb-4">
                  <Eye className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Нет одобренных товаров
                </h3>
                <p className="text-slate-300">
                  Ваши товары еще не прошли модерацию
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {approvedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {rejectedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-red-600/20 mb-4">
                  <Eye className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Нет отклоненных товаров
                </h3>
                <p className="text-slate-300">
                  Все ваши товары соответствуют правилам
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rejectedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      <CreateListingModal 
        open={showCreateListing} 
        onOpenChange={(open) => {
          console.log('onOpenChange вызван с:', open);
          setShowCreateListing(open);
        }} 
      />
    </div>
  );
}

<Button 
  onClick={() => alert('Кнопка работает!')} 
  className="bg-blue-600 hover:bg-blue-700"
>
  <Plus className="h-4 w-4 mr-2" />
  Добавить товар
</Button>
