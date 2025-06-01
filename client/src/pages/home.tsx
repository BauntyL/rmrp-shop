import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import CategoryGrid from "@/components/category-grid";
import CreateListingModal from "@/components/create-listing-modal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [showCreateListing, setShowCreateListing] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const mainCategories = categories.filter((cat: any) => !cat.parentId);

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    // Перенаправляем на страницу "мои товары"
    window.location.href = "/my-products";
  };

  const handleViewProducts = () => {
    // Автоматический скролл к секции категорий
    const categoriesSection = document.getElementById('categories');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleProductContact = (userId: number) => {
    window.location.href = `/messages?contact=${userId}`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              RMRP SHOP
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto font-medium">
              Торговая площадка для игровых товаров
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Button 
                onClick={handleCreateListing}
                className="bg-white text-blue-600 px-8 py-4 hover:bg-blue-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                size="lg"
              >
                Разместить объявление
              </Button>
              <Button 
                onClick={handleViewProducts}
                className="bg-blue-500 text-white hover:bg-blue-400 px-8 py-4 font-semibold text-lg transition-all duration-200 border-0 shadow-lg"
                size="lg"
              >
                Смотреть товары
              </Button>
            </div>
          </div>
        </div>
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Категории товаров</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Выберите категорию и найдите именно то, что вам нужно
            </p>
          </div>
          <CategoryGrid categories={mainCategories} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Рекомендуемые товары</h2>
            <p className="text-xl text-slate-300">Популярные предложения от наших продавцов</p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onContact={handleProductContact}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg mb-6">Пока нет товаров для отображения</p>
              <Button 
                onClick={handleCreateListing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
              >
                Разместить первое объявление
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      
      {showCreateListing && (
        <CreateListingModal 
          isOpen={showCreateListing} 
          onClose={() => setShowCreateListing(false)} 
        />
      )}
    </div>
  );
}

// В useEffect где загружаются категории
useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('Raw categories from API:', data); // Добавить эту строку
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  loadCategories();
}, []);

// Перед return в компоненте
const mainCategories = categories.filter(cat => !cat.parentId);
console.log('Filtered main categories:', mainCategories); // Добавить эту строку
