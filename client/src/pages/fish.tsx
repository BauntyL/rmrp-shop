import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Fish, Filter } from "lucide-react";
import type { ProductWithDetails } from "@/lib/types";
import CreateFishModal from "@/components/create-fish-modal";
import { motion, type Variants, type AnimationProps } from "framer-motion";

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

export default function FishPage() {
  const { isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedServer, setSelectedServer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithDetails[], Error, ProductWithDetails[]>({
    queryKey: ["/api/products", { categoryId: 3, search: searchQuery }],
  });

  const { data: servers = [] } = useQuery<Server[], Error, Server[]>({
    queryKey: ["/api/servers"],
  });

  const subcategories = [
    { id: "all", name: "Вся рыба", count: products.length },
    { id: "freshwater", name: "Пресноводная", count: 0 },
    { id: "saltwater", name: "Морская", count: 0 },
    { id: "rare", name: "Редкая", count: 0 },
    { id: "legendary", name: "Легендарная", count: 0 },
    { id: "exotic", name: "Экзотическая", count: 0 },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServer = selectedServer === "all" || product.serverId === parseInt(selectedServer);
    return matchesSearch && matchesServer;
  });

  const handleContactSeller = (userId: number) => {
    console.log("Связаться с продавцом:", userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-cyan-900/20 to-slate-900">
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
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3"
                animate={floatingAnimation}
              >
                <motion.div animate={glowingAnimation}>
                  <Fish className="h-10 w-10 text-cyan-400" />
                </motion.div>
                Рыба
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 mt-2 text-lg"
              >
                Покупайте и продавайте рыбу на серверах RMRP
              </motion.p>
            </div>
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="relative overflow-hidden group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Добавить объявление
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-8 bg-slate-800/50 backdrop-blur-lg border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <motion.div animate={floatingAnimation}>
                  <Filter className="h-5 w-5 text-cyan-400" />
                </motion.div>
                Фильтры
              </CardTitle>
              <CardDescription className="text-slate-300">
                Найдите лучшие уловы для вашего персонажа
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Поиск рыбы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/50 backdrop-blur-sm border-slate-600/50 text-white placeholder:text-slate-400 transition-all duration-200 focus:bg-slate-700/70 focus:border-cyan-500/50"
                />
              </div>
              
              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="bg-slate-700/50 backdrop-blur-sm border-slate-600/50 text-white transition-all duration-200 hover:bg-slate-700/70">
                    <SelectValue placeholder="Выберите сервер" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">Все серверы</SelectItem>
                    {servers.map((server) => (
                      <SelectItem key={server.id} value={server.id.toString()} className="text-white">
                        {server.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger className="bg-slate-700/50 backdrop-blur-sm border-slate-600/50 text-white transition-all duration-200 hover:bg-slate-700/70">
                    <SelectValue placeholder="Тип рыбы" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id} className="text-white">
                        {sub.name} ({sub.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Найдено {filteredProducts.length} видов рыбы
            </h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-none">
                {selectedServer === "all" ? "Все серверы" : servers.find((s) => s.id.toString() === selectedServer)?.name}
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-none">
                {subcategories.find(s => s.id === selectedSubcategory)?.name}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {productsLoading ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="animate-pulse bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
                  <CardContent className="p-4">
                    <div className="h-48 bg-slate-700/50 rounded-xl mb-4"></div>
                    <div className="h-4 bg-slate-700/50 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <ProductCard
                  product={product}
                  onContact={handleContactSeller}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center py-16 bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
              <CardContent>
                <motion.div animate={glowingAnimation}>
                  <Fish className="h-20 w-20 text-cyan-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-2">Рыба не найдена</h3>
                <p className="text-slate-300 mb-6 text-lg">
                  {searchQuery ? 
                    `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить параметры поиска.` :
                    "В данной категории пока нет объявлений."
                  }
                </p>
                {isAuthenticated && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)} 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Разместить первое объявление
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <Footer />
      
      {isCreateModalOpen && (
        <CreateFishModal 
          open={isCreateModalOpen}
          onOpenChange={(open) => setIsCreateModalOpen(open)}
        />
      )}
    </div>
  );
}