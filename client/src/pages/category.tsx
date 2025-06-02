import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { motion, type Variants, type AnimationProps } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: number;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  parentId: number | null;
}

interface Server {
  id: number;
  name: string;
  displayName: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  serverId: number;
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

export default function Category() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [serverId, setServerId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const category = categories.find((cat) => cat.name === categoryName && !cat.parentId);
  const subcategories = categories.filter((cat) => cat.parentId === category?.id);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { 
      categoryId: category?.id,
      subcategoryId: subcategoryId ? parseInt(subcategoryId) : undefined,
      serverId: serverId ? parseInt(serverId) : undefined,
      search: search || undefined,
    }],
    enabled: !!category,
  });

  const handleProductContact = (userId: number) => {
    window.location.href = `/messages?contact=${userId}`;
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
        >
          <motion.div animate={glowingAnimation}>
            <Search className="h-20 w-20 text-slate-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent mb-4">
            Категория не найдена
          </h1>
          <p className="text-slate-300 mb-6 text-lg">Запрошенная категория не существует</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => window.location.href = "/"} 
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-3 rounded-xl"
            >
              На главную
            </Button>
          </motion.div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 via-${category.color}-900/20 to-slate-900`}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-${category.color}-400 via-${category.color}-500 to-${category.color}-600 bg-clip-text text-transparent flex items-center gap-3`}
                animate={floatingAnimation}
              >
                <motion.div animate={glowingAnimation}>
                  <i className={`${category.icon} h-10 w-10 text-${category.color}-400`}></i>
                </motion.div>
                {category.displayName}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 mt-2 text-lg"
              >
                {products.length} товаров в этой категории
              </motion.p>
            </div>
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => window.location.href = "/?create=true"} 
                  className={`relative overflow-hidden group bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 text-white px-6 py-3 rounded-xl`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Добавить объявление
                  </span>
                  <div className={`absolute inset-0 bg-gradient-to-r from-${category.color}-600 to-${category.color}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Поиск товаров..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 transition-all duration-200 hover:bg-slate-700/70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={serverId} onValueChange={setServerId}>
                  <SelectTrigger className="bg-slate-700/50 backdrop-blur-sm border-slate-600/50 text-white transition-all duration-200 hover:bg-slate-700/70">
                    <SelectValue placeholder="Выберите сервер" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="" className="text-white">Все серверы</SelectItem>
                    {servers.map((server: any) => (
                      <SelectItem key={server.id} value={server.id.toString()} className="text-white">
                        {server.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {subcategories.length > 0 && (
                  <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                    <SelectTrigger className="bg-slate-700/50 backdrop-blur-sm border-slate-600/50 text-white transition-all duration-200 hover:bg-slate-700/70">
                      <SelectValue placeholder="Все подкатегории" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="" className="text-white">Все подкатегории</SelectItem>
                      {subcategories.map((subcat: any) => (
                        <SelectItem key={subcat.id} value={subcat.id.toString()} className="text-white">
                          {subcat.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-semibold bg-gradient-to-r from-${category.color}-400 to-${category.color}-500 bg-clip-text text-transparent`}>
              Найдено {products.length} товаров
            </h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className={`bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 text-white border-none`}>
                {serverId ? servers.find((s: any) => s.id.toString() === serverId)?.displayName : "Все серверы"}
              </Badge>
              {subcategoryId && (
                <Badge variant="secondary" className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-none">
                  {subcategories.find((s: any) => s.id.toString() === subcategoryId)?.displayName}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 animate-pulse"
              >
                <div className="w-full h-48 bg-slate-700/50 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
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
            <motion.div animate={glowingAnimation}>
              <i className={`${category.icon} text-5xl text-${category.color}-400 mb-4`}></i>
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Товары в категории "{category.displayName}" не найдены
            </h3>
            <p className="text-slate-300 mb-6 text-lg">
              {search || subcategoryId || serverId 
                ? "Попробуйте изменить фильтры поиска"
                : "Станьте первым, кто разместит товар в этой категории"
              }
            </p>
            {(!search && !subcategoryId && !serverId) && isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => window.location.href = "/?create=true"} 
                  className={`bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 hover:from-${category.color}-600 hover:to-${category.color}-500 text-white px-6 py-3 rounded-xl`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Разместить первое объявление
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product: any) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard 
                  product={product}
                  onContact={handleProductContact}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
