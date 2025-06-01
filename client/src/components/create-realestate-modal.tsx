import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Home, MapPin, Ruler, Bed, Building, Layers, X, Sparkles, Car, Warehouse, Plane, Phone, DollarSign, Image, FileText, MessageCircle, Users } from "lucide-react";

const createRealEstateSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(2), // Только недвижимость
  subcategoryId: z.coerce.number().min(1, "Выберите тип недвижимости"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    garageSpaces: z.coerce.number().min(1).max(6),
    warehouses: z.coerce.number().min(1).max(2),
    helipads: z.coerce.number().min(1).max(2),
    income: z.coerce.number().optional(), // Только для бизнеса
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    })
  }),
});

type CreateRealEstateFormData = z.infer<typeof createRealEstateSchema>;

interface CreateRealEstateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRealEstateModal({ open, onOpenChange }: CreateRealEstateModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/categories", { parentId: 2 }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateRealEstateFormData>({
    resolver: zodResolver(createRealEstateSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 2,
      subcategoryId: 0,
      serverId: 0,
      imageUrl: "",
      metadata: {
        garageSpaces: 1,
        warehouses: 1,
        helipads: 1,
        income: 0,
        contacts: {
          discord: "",
          telegram: "",
          phone: "",
        }
      },
    },
  });

  const selectedSubcategory = form.watch("subcategoryId");
  const isBusiness = subcategories.find((sub: any) => sub.id === selectedSubcategory)?.name === "realestate_business";

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateRealEstateFormData) => {
      const productData = {
        ...data,
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о недвижимости отправлено на модерацию",
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRealEstateFormData) => {
    createListingMutation.mutate(data);
  };

  // Функция для получения иконки типа недвижимости
  const getPropertyTypeIcon = (name: string) => {
    switch (name) {
      case "realestate_house": return <Home className="h-4 w-4" />;
      case "realestate_cottage": return <Building className="h-4 w-4" />;
      case "realestate_apartment": return <Layers className="h-4 w-4" />;
      case "realestate_business": return <Sparkles className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  // Удаляем дубликаты подкатегорий
  const uniqueSubcategories = subcategories.filter((subcategory: any, index: number, self: any[]) => 
    index === self.findIndex((s: any) => s.name === subcategory.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/20 text-white shadow-2xl shadow-emerald-500/10">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
        
        {/* Header with close button */}
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white hover:bg-emerald-500/20 rounded-full p-2 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogHeader className="text-center pb-8 pt-6 relative">
          {/* Animated icon with gradient background */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300">
            <Home className="h-12 w-12 text-white animate-pulse" />
          </div>
          <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent">
            Продать недвижимость
          </DialogTitle>
          <p className="text-slate-300 text-lg mt-3 max-w-md mx-auto">
            Создайте привлекательное объявление о продаже вашей недвижимости
          </p>
          {/* Decorative elements */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="w-8 h-1 bg-gradient-to-r from-transparent to-emerald-500 rounded-full" />
            <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
            <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-transparent rounded-full" />
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative">
            {/* Property Type Selection */}
            {uniqueSubcategories.length > 0 && (
              <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <Sparkles className="h-6 w-6 text-emerald-400" />
                        </div>
                        Тип недвижимости
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800/80 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-emerald-400/30 h-14 text-lg backdrop-blur-sm hover:bg-slate-700/80 transition-all duration-200">
                            <SelectValue placeholder="Выберите тип недвижимости" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800/95 border-emerald-500/30 backdrop-blur-md">
                          {uniqueSubcategories.map((subcategory: any) => (
                            <SelectItem 
                              key={subcategory.id} 
                              value={subcategory.id.toString()} 
                              className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-emerald-400">
                                  {getPropertyTypeIcon(subcategory.name)}
                                </div>
                                {subcategory.displayName}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Property Details Grid */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-emerald-300 mb-8 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Home className="h-6 w-6 text-emerald-400" />
                </div>
                Характеристики недвижимости
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="metadata.garageSpaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-semibold flex items-center gap-2 mb-3">
                        <Car className="h-5 w-5 text-emerald-400" />
                        Гаражные места
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800/80 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-emerald-400/30 h-12 backdrop-blur-sm">
                            <SelectValue placeholder="Количество" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800/95 border-emerald-500/30">
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()} className="text-white hover:bg-emerald-500/20">
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.warehouses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-semibold flex items-center gap-2 mb-3">
                        <Warehouse className="h-5 w-5 text-emerald-400" />
                        Склады
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800/80 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-emerald-400/30 h-12 backdrop-blur-sm">
                            <SelectValue placeholder="Количество" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800/95 border-emerald-500/30">
                          {[1, 2].map((num) => (
                            <SelectItem key={num} value={num.toString()} className="text-white hover:bg-emerald-500/20">
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.helipads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-semibold flex items-center gap-2 mb-3">
                        <Plane className="h-5 w-5 text-emerald-400" />
                        Вертолетные площадки
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800/80 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-emerald-400/30 h-12 backdrop-blur-sm">
                            <SelectValue placeholder="Количество" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800/95 border-emerald-500/30">
                          {[1, 2].map((num) => (
                            <SelectItem key={num} value={num.toString()} className="text-white hover:bg-emerald-500/20">
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Server Selection */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <FormField
                control={form.control}
                name="serverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Building className="h-6 w-6 text-emerald-400" />
                      </div>
                      Сервер
                    </FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800/80 border-emerald-500/30 text-white focus:border-emerald-400 focus:ring-emerald-400/30 h-14 text-lg backdrop-blur-sm">
                          <SelectValue placeholder="Выберите сервер" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800/95 border-emerald-500/30">
                        {servers.map((server: any) => (
                          <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-emerald-500/20">
                            {server.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Title, Image and Description */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-sm space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <FileText className="h-6 w-6 text-emerald-400" />
                      </div>
                      Название объявления
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Продается 3-комнатная квартира в центре" 
                        {...field} 
                        className="bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 h-14 text-lg backdrop-blur-sm" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Image className="h-6 w-6 text-emerald-400" />
                      </div>
                      Ссылка на фото
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        className="bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 h-14 text-lg backdrop-blur-sm" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <FileText className="h-6 w-6 text-emerald-400" />
                      </div>
                      Описание
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробно опишите недвижимость: состояние, ремонт, инфраструктуру, транспортную доступность..." 
                        rows={6}
                        {...field} 
                        className="bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 resize-none backdrop-blur-sm text-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                Контактная информация
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="metadata.contacts.discord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-indigo-400" />
                        Discord
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="user#0000" 
                          {...field} 
                          className="bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-indigo-500/50 transition-colors h-12 text-lg backdrop-blur-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.contacts.telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-400" />
                        Telegram
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="@user" 
                          {...field} 
                          className="bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-blue-500/50 transition-colors h-12 text-lg backdrop-blur-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.contacts.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-400" />
                        Номер телефона
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+7 123 456 78 90" 
                          {...field} 
                          className="bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-green-500/50 transition-colors h-12 text-lg backdrop-blur-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="w-8 h-1 bg-gradient-to-r from-transparent to-emerald-500 rounded-full" />
              <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
              <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-transparent rounded-full" />
            </div>

            {/* Price and Income */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        Цена
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="5500000" 
                            {...field}
                            className="pr-16 bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 h-14 text-xl font-bold backdrop-blur-sm"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 font-bold text-xl">₽</span>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {isBusiness && (
                  <FormField
                    control={form.control}
                    name="metadata.income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-300 font-bold text-xl flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <DollarSign className="h-6 w-6 text-emerald-400" />
                          </div>
                          Доход (в день)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              placeholder="50000" 
                              {...field}
                              className="pr-16 bg-slate-800/80 border-emerald-500/30 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30 h-14 text-xl font-bold backdrop-blur-sm"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 font-bold text-xl">₽</span>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-6 pt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1 border-emerald-500/30 text-slate-300 hover:bg-emerald-500/10 hover:text-white hover:border-emerald-400 h-14 text-lg font-semibold transition-all duration-200 backdrop-blur-sm"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={createListingMutation.isPending} 
                className="flex-1 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-600 hover:via-green-700 hover:to-emerald-800 text-white h-14 text-lg font-semibold shadow-2xl shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {createListingMutation.isPending ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Создание объявления...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Разместить объявление
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}