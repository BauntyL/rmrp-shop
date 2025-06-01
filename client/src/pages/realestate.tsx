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
import { Search, Plus, Home, Filter } from "lucide-react";
import type { ProductWithDetails } from "@/lib/types";

export default function RealEstate() {
  const { isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedServer, setSelectedServer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { categoryId: 2, search: searchQuery }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const subcategories = [
    { id: "all", name: "Вся недвижимость", count: products.length },
    { id: "apartments", name: "Квартиры", count: 0 },
    { id: "houses", name: "Дома", count: 0 },
    { id: "mansions", name: "Особняки", count: 0 },
    { id: "commercial", name: "Коммерческая", count: 0 },
    { id: "garages", name: "Гаражи", count: 0 },
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
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Home className="h-8 w-8 text-green-400" />
                Недвижимость
              </h1>
              <p className="text-slate-300 mt-2">
                Покупайте и продавайте недвижимость на серверах RMRP
              </p>
            </div>
            {isAuthenticated && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4" />
                Добавить объявление
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="h-5 w-5 text-green-400" />
              Фильтры
            </CardTitle>
            <CardDescription className="text-slate-300">
              Найдите идеальную недвижимость для вашего персонажа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Поиск недвижимости..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Выберите сервер" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all" className="text-white">Все серверы</SelectItem>
                  {servers.map((server: any) => (
                    <SelectItem key={server.id} value={server.id.toString()} className="text-white">
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Тип недвижимости" />
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

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Найдено {filteredProducts.length} объектов недвижимости
            </h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-600 text-white">
                {selectedServer === "all" ? "Все серверы" : servers.find((s: any) => s.id.toString() === selectedServer)?.name}
              </Badge>
              <Badge variant="secondary" className="bg-slate-600 text-white">
                {subcategories.find(s => s.id === selectedSubcategory)?.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="h-48 bg-slate-700 rounded mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
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
          <Card className="text-center py-16 bg-slate-800 border-slate-700">
            <CardContent>
              <Home className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Недвижимость не найдена</h3>
              <p className="text-slate-300 mb-6">
                {searchQuery ? 
                  `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить параметры поиска.` :
                  "В данной категории пока нет объявлений."
                }
              </p>
              {isAuthenticated && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                  Разместить первое объявление
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
      
      {isCreateModalOpen && (
        <CreateListingModal 
          open={isCreateModalOpen}
          onOpenChange={(open) => setIsCreateModalOpen(open)}
        />
      )}
    </div>
  );
}