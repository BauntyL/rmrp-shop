import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";

const loginSchema = z.object({
  login: z.string().min(1, "Логин или email обязательны"),
  password: z.string().min(1, "Пароль обязателен"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isAuthenticated, isLoginPending } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать обратно!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message || "Проверьте логин и пароль",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and title */}
        <div className="text-center animate-fade-in">
          <Link href="/">
            <div className="group cursor-pointer">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  RMRP SHOP
                </h1>
                <Sparkles className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <p className="text-slate-300 group-hover:text-white transition-colors">
                Торговая площадка для игровых товаров
              </p>
            </div>
          </Link>
        </div>

        {/* Login card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl animate-slide-up">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <LogIn className="h-6 w-6 text-purple-400" />
              <CardTitle className="text-2xl text-white">Вход в аккаунт</CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              Войдите в ваш аккаунт для доступа ко всем функциям
            </CardDescription>
            {/* Decorative gradient line */}
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mt-4"></div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email/Login field */}
                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-purple-400" />
                        <span>Email или логин</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            placeholder="Введите email или логин" 
                            {...field}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 group-hover:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Password field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-purple-400" />
                        <span>Пароль</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            type="password" 
                            placeholder="Введите пароль" 
                            {...field}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200 group-hover:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between pt-2">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-slate-300 cursor-pointer">
                          Запомнить меня
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Забыли пароль?
                  </a>
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  disabled={isLoginPending} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-purple-500/25"
                >
                  {isLoginPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Вход...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Войти</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Register link */}
            <div className="text-center pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                Нет аккаунта?{" "}
                <Link href="/register">
                  <a className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                    Зарегистрироваться
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
