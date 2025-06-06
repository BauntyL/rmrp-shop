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
import { Plus, Eye, Edit, Trash2, Package } from "lucide-react";
import { motion, type Variants, type AnimationProps } from "framer-motion";
import type { ProductWithDetails } from "@/lib/types";

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

export default function MyProducts() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateListing, setShowCreateListing] = useState(false);
  
  const { data: products = [], isLoading } = useQuery<ProductWithDetails[]>({
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900/20 to-slate-900">
        <Header />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
        >
          <motion.div animate={glowingAnimation}>
            <Package className="h-20 w-20 text-emerald-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-4">
            Доступ ограничен
          </h1>
          <p className="text-slate-300 mb-6 text-lg">Войдите в систему для просмотра ваших товаров</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => window.location.href = "/login"} 
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-500 text-white px-6 py-3 rounded-xl"
            >
              Войти
            </Button>
          </motion.div>
        </motion.div>
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
    return products.filter((product: ProductWithDetails) => product.status === status);
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

  const ProductCard = ({ product }: { product: ProductWithDetails }) => (
    <Card className="overflow-hidden bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl group">
      <div className="relative overflow-hidden">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
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
        <motion.h3 
          whileHover={{ color: "#60A5FA" }}
          className="font-semibold text-white mb-1 line-clamp-1 cursor-pointer" 
          onClick={() => handleViewProduct(product.id)}
        >
          {product.title}
        </motion.h3>
        <p className="text-sm text-slate-300 mb-2 line-clamp-2">
          {product.description}
        </p>
        <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-3">
          {formatPrice(product.price)}
        </p>
        
        <div className="flex space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm"
              onClick={() => handleViewProduct(product.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Просмотр
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm"
              onClick={() => handleEditProduct(product.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Редактировать
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-400 hover:text-red-300 border-slate-600/50 hover:bg-slate-700/50 backdrop-blur-sm"
              onClick={() => handleDeleteProduct(product.id, product.title)}
              disabled={deleteProductMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {product.status === "rejected" && (product as any).moderatorNote && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 bg-red-900/20 backdrop-blur-sm border border-red-700/50 rounded-lg"
          >
            <p className="text-sm text-red-200">
              <strong>Причина отклонения:</strong> {(product as any).moderatorNote}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-900/20 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div animate={floatingAnimation}>
              <Package className="h-10 w-10 text-emerald-400" />
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent"
              animate={floatingAnimation}
            >
              Мои товары
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg"
          >
            Управляйте вашими объявлениями
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-slate-300">
                Все ({products.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-slate-300">
                На модерации ({pendingProducts.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-slate-300">
                Одобренные ({approvedProducts.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white text-slate-300">
                Отклоненные ({rejectedProducts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-xl p-4 animate-pulse border border-slate-700/50"
                    >
                      <div className="bg-slate-700/50 rounded-lg h-32 mb-4"></div>
                      <div className="bg-slate-700/50 rounded h-4 mb-2"></div>
                      <div className="bg-slate-700/50 rounded h-3 mb-4"></div>
                      <div className="bg-slate-700/50 rounded h-6"></div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-16"
                >
                  <motion.div 
                    animate={glowingAnimation}
                    className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-lg mb-6"
                  >
                    <Package className="h-16 w-16 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    У вас еще нет товаров
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Перейдите в нужную категорию для создания объявления
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {products.map((product: ProductWithDetails) => (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {pendingProducts.map((product: ProductWithDetails) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="approved">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {approvedProducts.map((product: ProductWithDetails) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="rejected">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {rejectedProducts.map((product: ProductWithDetails) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}