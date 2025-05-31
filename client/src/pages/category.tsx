import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Category() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [search, setSearch] = useState("");
  const [serverId, setServerId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const category = categories.find((cat: any) => cat.name === categoryName && !cat.parentId);
  const subcategories = categories.filter((cat: any) => cat.parentId === category?.id);

  const { data: products = [], isLoading } = useQuery({
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h1>
          <p className="text-gray-600">Запрошенная категория не существует</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 rounded-lg bg-gradient-to-br from-${category.color}-500 to-${category.color}-600`}>
              <i className={`${category.icon} text-2xl text-white`}></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.displayName}</h1>
              <p className="text-gray-600">{products.length} товаров</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск товаров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {subcategories.length > 0 && (
              <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Все подкатегории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все подкатегории</SelectItem>
                  {subcategories.map((subcat: any) => (
                    <SelectItem key={subcat.id} value={subcat.id.toString()}>
                      {subcat.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={serverId} onValueChange={setServerId}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Все серверы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все серверы</SelectItem>
                {servers.map((server: any) => (
                  <SelectItem key={server.id} value={server.id.toString()}>
                    {server.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-flex p-4 rounded-full bg-gradient-to-br from-${category.color}-500 to-${category.color}-600 mb-4`}>
              <i className={`${category.icon} text-3xl text-white`}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Товары в категории "{category.displayName}" не найдены
            </h3>
            <p className="text-gray-600 mb-6">
              {search || subcategoryId || serverId 
                ? "Попробуйте изменить фильтры поиска"
                : "Станьте первым, кто разместит товар в этой категории"
              }
            </p>
            {(!search && !subcategoryId && !serverId) && (
              <Button onClick={() => window.location.href = "/?create=true"}>
                Разместить первое объявление
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={product}
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
