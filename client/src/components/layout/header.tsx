import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Server {
  id: number;
  name: string;
  displayName: string;
}

interface Favorite {
  id: number;
  productId: number;
  userId: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedServer, setSelectedServer] = useState<string>("all");

  const userInitials = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return "";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }, [user?.firstName, user?.lastName]);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["servers"],
    queryFn: async () => {
      const response = await fetch("/api/servers");
      return response.json();
    },
  });

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch("/api/favorites");
      return response.json();
    },
  });

  // Добавляем запрос для получения количества непрочитанных сообщений
  const { data: unreadData } = useQuery({
    queryKey: ["/api/messages/unread-count"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  const unreadCount = unreadData?.count || 0;

  const mainNav = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    { name: "О нас", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              RMRP Shop
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  item.href === location ? "text-foreground" : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search Component */}
          </div>
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link href="/favorites" className="relative">
                  <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                    <Heart className="h-5 w-5" />
                    {favorites.length > 0 && (
                      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-foreground hover:bg-accent">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} />
                        <AvatarFallback className="bg-accent text-foreground">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLocation('/profile')}>
                      <User className="mr-2" />
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/settings')}>
                      <Settings className="mr-2" />
                      Настройки
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500 hover:text-red-600">
                      <LogOut className="mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="default" onClick={() => setLocation('/login')}>
                Войти
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}