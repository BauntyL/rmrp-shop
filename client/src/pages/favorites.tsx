import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ ограничен</h1>
          <p className="text-gray-600 mb-6">Войдите в систему для просмотра избранных товаров</p>
          <Button onClick={() => window.location.href = "/login"}>
            Войти
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Избранное</h1>
          </div>
          <p className="text-gray-600">
            {favorites.length === 0 
              ? "У вас пока нет избранных товаров"
              : `У вас ${favorites.length} избранных товаров`
            }
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 mb-4"></div>
                <div className="bg-gray-200 rounded h-6"></div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-red-100 mb-6">
              <Heart className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Избранные товары не найдены
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Нажимайте на сердечко на карточках товаров, чтобы добавить их в избранное
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = "/"}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Посмотреть товары
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/category/cars"}>
                Авто
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/category/realestate"}>
                Недвижимость
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/category/fish"}>
                Рыба
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/category/treasures"}>
                Клады
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={{ ...product, isFavorite: true }}
                onContact={handleProductContact}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
