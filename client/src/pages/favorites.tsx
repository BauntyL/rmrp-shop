import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
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

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const handleProductContact = (userId: number) => {
    window.location.href = `/messages?contact=${userId}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-rose-900/20 to-slate-900">
        <Header />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
        >
          <motion.div animate={glowingAnimation}>
            <Heart className="h-20 w-20 text-rose-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent mb-4">
            Доступ ограничен
          </h1>
          <p className="text-slate-300 mb-6 text-lg">Войдите в систему для просмотра избранных товаров</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => window.location.href = "/login"} 
              className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-red-600 hover:to-rose-500 text-white px-6 py-3 rounded-xl"
            >
              Войти
            </Button>
          </motion.div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-rose-900/20 to-slate-900">
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
              <Heart className="h-10 w-10 text-rose-400" />
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-red-500 to-rose-600 bg-clip-text text-transparent"
              animate={floatingAnimation}
            >
              Избранное
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg"
          >
            {favorites.length === 0 
              ? "У вас пока нет избранных товаров"
              : `У вас ${favorites.length} избранных товаров`
            }
          </motion.p>
        </motion.div>

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
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-xl p-4 animate-pulse border border-slate-700/50"
              >
                <div className="bg-slate-700/50 rounded-lg h-48 mb-4"></div>
                <div className="bg-slate-700/50 rounded h-4 mb-2"></div>
                <div className="bg-slate-700/50 rounded h-3 mb-4"></div>
                <div className="bg-slate-700/50 rounded h-6"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : favorites.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <motion.div 
              animate={glowingAnimation}
              className="inline-flex p-4 rounded-full bg-gradient-to-br from-rose-500/20 to-red-600/20 backdrop-blur-lg mb-6"
            >
              <Heart className="h-16 w-16 text-rose-400" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Избранные товары не найдены
            </h3>
            <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg">
              Нажимайте на сердечко на карточках товаров, чтобы добавить их в избранное
            </p>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => window.location.href = "/"} 
                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-red-600 hover:to-rose-500 text-white px-6 py-3 rounded-xl"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Посмотреть товары
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/category/cars"} 
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white backdrop-blur-lg px-6 py-3 rounded-xl"
                >
                  Авто
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/category/realestate"} 
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white backdrop-blur-lg px-6 py-3 rounded-xl"
                >
                  Недвижимость
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/category/fish"} 
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white backdrop-blur-lg px-6 py-3 rounded-xl"
                >
                  Рыба
                </Button>
              </motion.div>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/category/treasures"} 
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:text-white backdrop-blur-lg px-6 py-3 rounded-xl"
                >
                  Клады
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map((product: any) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <ProductCard 
                  product={{ ...product, isFavorite: true }}
                  onContact={handleProductContact}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
