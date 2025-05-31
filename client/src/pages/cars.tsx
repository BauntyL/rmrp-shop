import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import CreateListingModal from "@/components/create-listing-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Car, Filter } from "lucide-react";
import type { ProductWithDetails } from "@/lib/types";

export default function Cars() {
  const { isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedServer, setSelectedServer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { categoryId: 1, search: searchQuery }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const subcategories = [
    { id: "all", name: "Все автомобили", count: products.length },
    { id: "sports", name: "Спортивные", count: 0 },
    { id: "luxury", name: "Люксовые", count: 0 },
    { id: "suv", name: "Внедорожники", count: 0 },
    { id: "classic", name: "Классические", count: 0 },
    { id: "tuned", name: "Тюнингованные", count: 0 },
  ];

  const filteredProducts = products.filter((product: ProductWithDetails) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServer = selectedServer === "all" || product.serverId === parseInt(selectedServer);
    return matchesSearch && matchesServer;
  });

  const handleContactSeller = (userId: number) => {
    console.log("Связаться с продавцом:", userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Car className="h-8 w-8 text-blue-600" />
                Автомобили
              </h1>
              <p className="text-gray-600 mt-2">
                Покупайте и продавайте игровые автомобили на серверах RMRP
              </p>
            </div>
            {isAuthenticated && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить объявление
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры
            </CardTitle>
            <CardDescription>
              Найдите идеальный автомобиль для вашего персонажа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск автомобилей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Subcategory Filter */}
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Тип автомобиля" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name} ({subcategory.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Server Filter */}
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue placeholder="Сервер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все серверы</SelectItem>
                  {servers.map((server: any) => (
                    <SelectItem key={server.id} value={server.id.toString()}>
                      {server.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="flex items-center gap-2">
                <Input placeholder="От" type="number" />
                <span className="text-gray-400">-</span>
                <Input placeholder="До" type="number" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Subcategories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Популярные категории</h2>
          <div className="flex flex-wrap gap-3">
            {subcategories.slice(1).map((subcategory) => (
              <Badge
                key={subcategory.id}
                variant={selectedSubcategory === subcategory.id ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedSubcategory(subcategory.id)}
              >
                {subcategory.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Найдено {filteredProducts.length} объявлений
          </p>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: ProductWithDetails) => (
              <ProductCard
                key={product.id}
                product={product}
                onContact={handleContactSeller}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Автомобили не найдены
              </h3>
              <p className="text-gray-600 mb-6">
                Попробуйте изменить параметры поиска или {isAuthenticated ? "создайте" : "войдите, чтобы создать"} первое объявление
              </p>
              {isAuthenticated && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить автомобиль
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Советы по покупке автомобилей</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2">
              <li>• Проверьте характеристики автомобиля перед покупкой</li>
              <li>• Убедитесь, что у продавца есть права на продажу</li>
              <li>• Договоритесь о месте и времени передачи автомобиля</li>
              <li>• Проверьте историю автомобиля и возможные модификации</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />

      <CreateListingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}