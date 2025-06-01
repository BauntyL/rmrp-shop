import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, MessageCircle, Menu, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [selectedServer, setSelectedServer] = useState("arbat");

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const navigation = [
    { name: "Главная", href: "/" },
    { name: "Авто", href: "/category/cars" },
    { name: "Недвижимость", href: "/category/realestate" },
    { name: "Рыба", href: "/category/fish" },
    { name: "Клады", href: "/category/treasures" },
  ];

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : "";

  return (
    <header className="bg-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">RMRP SHOP</h1>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span className={`font-medium transition-colors cursor-pointer ${
                  location === item.href 
                    ? "text-blue-400" 
                    : "text-slate-300 hover:text-blue-400"
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Server Selector */}
            <div className="hidden md:block">
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {servers.map((server: any) => (
                    <SelectItem key={server.name} value={server.name} className="text-white hover:bg-slate-700">
                      {server.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAuthenticated ? (
              <>
                {/* Favorites */}
                <Link href="/favorites">
                  <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white hover:bg-slate-800">
                    <Heart className="h-5 w-5" />
                    {favorites.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 hover:bg-blue-700">
                        {favorites.length}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white hover:bg-slate-800">
                    <MessageCircle className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600 hover:bg-blue-700">
                      2
                    </Badge>
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                        <AvatarFallback className="bg-slate-700 text-white">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-600">
                    <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Link href="/my-products">Мои товары</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Link href="/favorites">Избранное</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-slate-700">
                      <Link href="/messages">Диалоги</Link>
                    </DropdownMenuItem>
                    {(user?.role === "admin" || user?.role === "moderator") && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-600" />
                        <DropdownMenuItem asChild className="text-slate-300 hover:text-white hover:bg-slate-700">
                          <Link href="/admin">Администрирование</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-slate-600" />
                    <DropdownMenuItem onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">Войти</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Регистрация</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-900 border-slate-700">
                <div className="py-4">
                  <nav className="space-y-4">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <span className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
