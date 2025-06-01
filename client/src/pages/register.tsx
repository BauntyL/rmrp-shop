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
import { UserPlus, User, Mail, Lock, Sparkles, Shield } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  email: z.string().email("Некорректный email"),
  username: z.string().min(3, "Логин должен содержать минимум 3 символа"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, "Необходимо согласиться с условиями"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, isAuthenticated, isRegisterPending } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      toast({
        title: "Регистрация успешна",
        description: "Добро пожаловать в RMRP SHOP!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Попробуйте еще раз",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and title */}
        <div className="text-center animate-fade-in">
          <Link href="/">
            <div className="group cursor-pointer">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="h-8 w-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  RMRP SHOP
                </h1>
                <Sparkles className="h-8 w-8 text-teal-400 group-hover:text-teal-300 transition-colors" />
              </div>
              <p className="text-slate-300 group-hover:text-white transition-colors">
                Торговая площадка для игровых товаров
              </p>
            </div>
          </Link>
        </div>

        {/* Register card */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl animate-slide-up">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <UserPlus className="h-6 w-6 text-emerald-400" />
              <CardTitle className="text-2xl text-white">Регистрация</CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              Создайте аккаунт для размещения объявлений
            </CardDescription>
            {/* Decorative gradient line */}
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mt-4"></div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                          <User className="h-4 w-4 text-emerald-400" />
                          <span>Имя</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              placeholder="Ваше имя" 
                              {...field}
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 group-hover:border-slate-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                          <User className="h-4 w-4 text-emerald-400" />
                          <span>Фамилия</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              placeholder="Ваша фамилия" 
                              {...field}
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 group-hover:border-slate-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-emerald-400" />
                        <span>Email</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            type="email" 
                            placeholder="user@example.com" 
                            {...field}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 group-hover:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Username field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                        <User className="h-4 w-4 text-emerald-400" />
                        <span>Логин</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            placeholder="Выберите логин" 
                            {...field}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 group-hover:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Password fields */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-emerald-400" />
                        <span>Пароль</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            type="password" 
                            placeholder="Создайте пароль" 
                            {...field}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 group-hover:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-200 font-medium flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        <span>Подтверждение пароля</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            type="password" 
                            placeholder="Повторите пароль" 
                            {...field}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 group-hover:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Terms agreement */}
                <FormField
                  control={form.control}
                  name="agreeTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="border-slate-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-slate-300 cursor-pointer">
                          Я соглашаюсь с{" "}
                          <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            условиями использования
                          </a>
                        </FormLabel>
                        <FormMessage className="text-red-400" />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit button */}
                <Button 
                  type="submit" 
                  disabled={isRegisterPending} 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-emerald-500/25"
                >
                  {isRegisterPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Регистрация...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Зарегистрироваться</span>
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Login link */}
            <div className="text-center pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                Уже есть аккаунт?{" "}
                <Link href="/login">
                  <a className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Войти
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
