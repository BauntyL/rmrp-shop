import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import CreateListingModal from "@/components/create-listing-modal";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, TrendingUp, Package } from "lucide-react";
import type { ProductWithDetails } from "@/lib/types";
import { motion, type Variants, type AnimationProps } from "framer-motion";

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
  y: [-10, 10],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  }
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [showCreateListing, setShowCreateListing] = useState(false);

  const { data: featuredProducts = [] } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", { status: "approved" }],
  });

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    window.location.href = "/my-products";
  };

  const handleProductContact = (userId: number) => {
    window.location.href = `/messages?contact=${userId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            className="text-center space-y-12"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.h1 
                className="text-6xl md:text-8xl font-bold"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  backgroundImage: "linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899, #60A5FA)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                RMRP SHOP
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-blue-100/80 max-w-2xl mx-auto font-medium"
              >
                Торговая площадка для игровых товаров
              </motion.p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleCreateListing}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-violet-500 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Разместить объявление
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
            >
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center"
              >
                <motion.div animate={floatingAnimation} className="mb-4">
                  <ShoppingBag className="w-10 h-10 mx-auto text-blue-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Быстрые сделки</h3>
                <p className="text-blue-100/70">Простой и удобный процесс размещения объявлений</p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center"
              >
                <motion.div animate={floatingAnimation} className="mb-4">
                  <TrendingUp className="w-10 h-10 mx-auto text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Актуальные цены</h3>
                <p className="text-blue-100/70">Рыночные цены на все товары</p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center"
              >
                <motion.div animate={floatingAnimation} className="mb-4">
                  <Package className="w-10 h-10 mx-auto text-pink-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">Безопасность</h3>
                <p className="text-blue-100/70">Проверенные продавцы и система модерации</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Рекомендуемые товары
            </h2>
            <p className="text-xl text-blue-100/70">
              Популярные предложения от наших продавцов
            </p>
          </motion.div>
          
          {featuredProducts.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <ProductCard
                    product={product}
                    onContact={handleProductContact}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 bg-white/5 backdrop-blur-lg rounded-2xl"
            >
              <p className="text-blue-100/70 text-lg mb-6">Пока нет товаров для отображения</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleCreateListing}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Разместить первое объявление
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.section>

      <Footer />
      
      {showCreateListing && (
        <CreateListingModal 
          open={showCreateListing} 
          onOpenChange={setShowCreateListing} 
        />
      )}
    </div>
  );
}
