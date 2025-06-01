import { useState } from "react";
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
      // Redirect to login
      window.location.href = "/login";
      return;
    }
    setShowCreateListing(true);
  };

  const handleProductContact = (userId: number) => {
    // Navigate to messages with specific user
    window.location.href = `/messages?contact=${userId}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              RMRP SHOP
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
              Торговая площадка для игровых товаров
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Button 
                onClick={handleCreateListing}
                className="bg-white text-blue-600 px-8 py-4 hover:bg-blue-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                Разместить объявление
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 font-semibold text-lg transition-all duration-200"
                size="lg"
                asChild
              >
                <Link href="#categories">Смотреть товары</Link>
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
      <section id="categories" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Категории товаров</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Выберите категорию и найдите именно то, что вам нужно
            </p>
          </div>
          <CategoryGrid categories={mainCategories} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Рекомендуемые товары</h2>
              <p className="text-xl text-gray-600">Популярные предложения от наших продавцов</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold text-lg px-6 py-3" 
              asChild
            >
              <Link href="/category/all">
                Смотреть все <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Товары еще не добавлены</h3>
                <p className="text-gray-600 mb-8">Станьте первым продавцом на нашей платформе!</p>
                <Button 
                  onClick={handleCreateListing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold"
                >
                  Стать первым продавцом
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 8).map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onContact={handleProductContact}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <CreateListingModal 
        open={showCreateListing} 
        onOpenChange={setShowCreateListing} 
      />
    </div>
  );
}
