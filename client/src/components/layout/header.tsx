import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, MessageCircle, Menu, ChevronDown } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [selectedServer, setSelectedServer] = useState("arbat");

  const navigation = [
    { name: "Главная", href: "/" },
    { name: "Авто", href: "/products?category=auto" },
    { name: "Недвижимость", href: "/products?category=realty" },
    { name: "Рыба", href: "/products?category=fish" },
    { name: "Клады", href: "/products?category=treasures" },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <span className="text-white font-bold text-xl">RMRP SHOP</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Server Selection */}
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-20 bg-slate-800 border-slate-600 text-slate-300 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="arbat" className="text-slate-300 hover:bg-slate-700">
                  arbat
                </SelectItem>
                <SelectItem value="server2" className="text-slate-300 hover:bg-slate-700">
                  server2
                </SelectItem>
              </SelectContent>
            </Select>

            {isAuthenticated ? (
              <>
                {/* Favorites */}
                <Link href="/favorites">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user?.firstName}</span>
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
