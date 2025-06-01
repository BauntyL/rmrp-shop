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
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              RMRP SHOP
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Торговая площадка для игровых товаров
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                onClick={handleCreateListing}
                className="bg-white text-primary px-8 py-3 hover:bg-gray-50 font-semibold"
                size="lg"
              >
                Разместить объявление
              </Button>
              <Button 
                className="bg-white text-primary px-8 py-3 hover:bg-gray-50 font-semibold"
                size="lg"
                asChild
              >
                <Link href="#categories">Смотреть товары</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Категории товаров</h2>
          <CategoryGrid categories={mainCategories} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Рекомендуемые товары</h2>
            <Button variant="ghost" className="text-primary hover:text-secondary font-semibold" asChild>
              <Link href="/category/all">
                Смотреть все <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">Товары еще не добавлены</p>
              <Button onClick={handleCreateListing}>
                Стать первым продавцом
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
