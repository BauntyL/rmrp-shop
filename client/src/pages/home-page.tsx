import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlusCircle, 
  Car, 
  Heart, 
  Users,
  Shield,
  Lock
} from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { CarCard } from "@/components/car-card";
import { AddCarModal } from "@/components/add-car-modal";
import { MessagesPanel } from "@/components/messages-panel";
import { ModerationPanel } from "@/components/moderation-panel";
import { UserManagementPanel } from "@/components/user-management-panel";
import { MessageModerationPanel } from "@/components/message-moderation-panel";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("catalog");
  const [addCarModalOpen, setAddCarModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServer, setSelectedServer] = useState("all");
  const [selectedSort, setSelectedSort] = useState("all");

  // Основные запросы данных
  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ["/api/cars"],
    refetchInterval: 30000,
  });

  const { data: userCars = [], isLoading: userCarsLoading } = useQuery({
    queryKey: ["/api/my-cars"],
    refetchInterval: 30000,
  });

  const { data: favoriteCars = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
    refetchInterval: 30000,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/my-applications"],
    refetchInterval: 10000,
  });

  // Фильтрация данных для каталога
  const filteredCars = cars.filter((car: any) => {
    const matchesSearch = car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    const matchesServer = selectedServer === "all" || car.server === selectedServer;
    return matchesSearch && matchesCategory && matchesServer;
  });

  // Сортировка
  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  // Рендер основного контента
  const renderMainContent = () => {
    switch (activeSection) {
      case "catalog":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Каталог автомобилей</h1>
                <p className="text-slate-400">Найдите автомобиль своей мечты</p>
              </div>
              <Button 
                onClick={() => setAddCarModalOpen(true)} 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Добавить авто
              </Button>
            </div>

            <div className="flex space-x-4 bg-slate-800 p-4 rounded-lg">
              <div className="flex-1">
                <Input
                  placeholder="Поиск автомобилей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="Стандарт">Стандарт</SelectItem>
                  <SelectItem value="Купе">Купе</SelectItem>
                  <SelectItem value="Внедорожники">Внедорожники</SelectItem>
                  <SelectItem value="Спорт">Спорт</SelectItem>
                  <SelectItem value="Мотоциклы">Мотоциклы</SelectItem>
                  <SelectItem value="Специальные">Специальные</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Сервер" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">Все серверы</SelectItem>
                  <SelectItem value="Арбат">Арбат</SelectItem>
                  <SelectItem value="Патрики">Патрики</SelectItem>
                  <SelectItem value="Рублевка">Рублевка</SelectItem>
                  <SelectItem value="Тверской">Тверской</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">По умолчанию</SelectItem>
                  <SelectItem value="newest">Сначала новые</SelectItem>
                  <SelectItem value="price-low">Сначала дешевые</SelectItem>
                  <SelectItem value="price-high">Сначала дорогие</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-slate-400 text-sm">
              Найдено: {sortedCars.length} автомобилей
            </div>

            {carsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
                    <div className="w-full h-48 bg-slate-700 rounded-lg mb-4"></div>
                    <div className="h-6 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : sortedCars.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  Автомобили не найдены
                </h3>
                <p className="text-slate-500">
                  {searchTerm || selectedCategory !== "all" || selectedServer !== "all"
                    ? "Попробуйте изменить критерии поиска"
                    : "Станьте первым, кто добавит автомобиль в каталог!"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCars.map((car: any) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        );

      case "favorites":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Избранные автомобили</h2>
            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
                    <div className="w-full h-48 bg-slate-700 rounded-lg mb-4"></div>
                    <div className="h-6 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : favoriteCars.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  Нет избранных автомобилей
                </h3>
                <p className="text-slate-500">
                  Добавляйте автомобили в избранное, нажимая на сердечко
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteCars.map((car: any) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        );

      case "my-cars":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">Мои автомобили</h2>
              <Button 
                onClick={() => setAddCarModalOpen(true)} 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Добавить автомобиль
              </Button>
            </div>

            {userCarsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
                    <div className="w-full h-48 bg-slate-700 rounded-lg mb-4"></div>
                    <div className="h-6 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : userCars.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  У вас нет автомобилей
                </h3>
                <p className="text-slate-500">
                  Добавьте свой первый автомобиль в каталог
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCars.map((car: any) => (
                  <CarCard key={car.id} car={car} showEditButton={true} />
                ))}
              </div>
            )}
          </div>
        );

      case "applications":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Мои заявки</h1>
              <Button 
                onClick={() => setAddCarModalOpen(true)} 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Подать заявку
              </Button>
            </div>

            {applicationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-slate-700 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-slate-700 rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-slate-700 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  У вас нет заявок
                </h3>
                <p className="text-slate-500">
                  Подайте заявку на добавление автомобиля
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application: any) => (
                  <div key={application.id} className="bg-slate-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {application.name}
                        </h3>
                        <p className="text-slate-400 mb-2">{application.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>Категория: {application.category}</span>
                          <span>Сервер: {application.server}</span>
                        </div>
                        <p className="text-emerald-400 font-semibold mt-2">
                          {application.price ? `${application.price.toLocaleString()} ₽` : 'Цена не указана'}
                        </p>
                      </div>
                      <Badge 
                        className={`
                          ${application.status === 'pending' ? 'bg-yellow-500 text-yellow-900' : ''}
                          ${application.status === 'approved' ? 'bg-green-500 text-green-900' : ''}
                          ${application.status === 'rejected' ? 'bg-red-500 text-red-900' : ''}
                        `}
                      >
                        {application.status === 'pending' && 'На модерации'}
                        {application.status === 'approved' && 'Одобрено'}
                        {application.status === 'rejected' && 'Отклонено'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      Подано: {new Date(application.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "messages":
        return <MessagesPanel />;

      case "security":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Безопасность</h1>
            
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-emerald-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">Настройки безопасности</h2>
              </div>
              
              <div className="space-y-4 text-slate-400">
                <p>• Ваш аккаунт защищен паролем</p>
                <p>• Все действия в системе логируются</p>
                <p>• При подозрительной активности администраторы получают уведомления</p>
                <p>• Ваши личные данные не передаются третьим лицам</p>
              </div>
              
              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Советы по безопасности:</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Не передавайте данные своего аккаунта третьим лицам</li>
                  <li>• При встрече с покупателями выбирайте публичные места</li>
                  <li>• Проверяйте документы на автомобили перед покупкой</li>
                  <li>• Сообщайте о подозрительных пользователях администрации</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "moderation":
        return <ModerationPanel />;

      case "message-moderation":
        return <MessageModerationPanel />;

      case "users":
        return <UserManagementPanel />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Раздел в разработке</h2>
            <p className="text-slate-400">Этот раздел скоро будет доступен</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderMainContent()}
        </div>
      </main>

      <AddCarModal 
        open={addCarModalOpen} 
        onOpenChange={setAddCarModalOpen}
      />
    </div>
  );
}
