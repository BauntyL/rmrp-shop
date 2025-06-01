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
import { Gem, Star, Crown, Sparkles, Scroll, Shield, Loader2 } from "lucide-react";

const createTreasureSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(4), // Только сокровища
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    rarity: z.string().optional(),
    material: z.string().optional(),
    origin: z.string().optional(),
    condition: z.string().optional(),
    enchantment: z.string().optional(),
  }).optional(),
});

type CreateTreasureFormData = z.infer<typeof createTreasureSchema>;

interface CreateTreasureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTreasureModal({ open, onOpenChange }: CreateTreasureModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/categories", { parentId: 4 }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateTreasureFormData>({
    resolver: zodResolver(createTreasureSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 4,
      subcategoryId: undefined,
      serverId: 0,
      imageUrl: "", // Добавить эту строку
      metadata: {
        rarity: "",
        material: "",
        origin: "",
        condition: "",
        enchantment: "",
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateTreasureFormData) => {
      const productData = {
        ...data,
        images: data.imageUrl ? [data.imageUrl] : [], // Добавить эту строку
      };
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о сокровище отправлено на модерацию",
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

  const onSubmit = (data: CreateTreasureFormData) => {
    createListingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-amber-900 border-purple-500/20 text-white animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="text-center pb-8 relative">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 rounded-full animate-pulse" />
          
          {/* Floating sparkles animation */}
          <div className="absolute top-4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          <div className="absolute top-8 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-6 left-3/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping" style={{animationDelay: '1s'}} />
          
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 via-amber-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/40 animate-pulse relative">
            <Gem className="h-12 w-12 text-white" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-purple-400/20 animate-spin" style={{animationDuration: '3s'}} />
          </div>
          <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-amber-300 to-purple-300 bg-clip-text text-transparent mb-3">
            Продать сокровище
          </DialogTitle>
          <p className="text-purple-200/80 text-lg">Создайте объявление о продаже редкого сокровища</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Category Selection */}
            {subcategories.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Тип сокровища
                </h3>
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium">Категория</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200">
                            <SelectValue placeholder="Выберите тип сокровища" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-purple-500/30">
                          {subcategories.map((subcategory: any) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()} className="text-white hover:bg-purple-600/20">
                              {subcategory.displayName}
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

            {/* Treasure Properties */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Свойства сокровища
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="metadata.rarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Редкость
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200">
                            <SelectValue placeholder="Выберите редкость" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-purple-500/30">
                          <SelectItem value="common" className="text-gray-300 hover:bg-purple-600/20">⚪ Обычное</SelectItem>
                          <SelectItem value="uncommon" className="text-green-300 hover:bg-purple-600/20">🟢 Необычное</SelectItem>
                          <SelectItem value="rare" className="text-blue-300 hover:bg-purple-600/20">🔵 Редкое</SelectItem>
                          <SelectItem value="epic" className="text-purple-300 hover:bg-purple-600/20">🟣 Эпическое</SelectItem>
                          <SelectItem value="legendary" className="text-amber-300 hover:bg-purple-600/20">🟡 Легендарное</SelectItem>
                          <SelectItem value="mythic" className="text-red-300 hover:bg-purple-600/20">🔴 Мифическое</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Материал
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Золото, Серебро, Платина..." 
                          {...field} 
                          className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Scroll className="h-4 w-4" />
                        Происхождение
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Древний храм, Пиратский клад..." 
                          {...field} 
                          className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Состояние
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200">
                            <SelectValue placeholder="Выберите состояние" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-purple-500/30">
                          <SelectItem value="perfect" className="text-white hover:bg-purple-600/20">✨ Идеальное</SelectItem>
                          <SelectItem value="excellent" className="text-white hover:bg-purple-600/20">⭐ Отличное</SelectItem>
                          <SelectItem value="good" className="text-white hover:bg-purple-600/20">👍 Хорошее</SelectItem>
                          <SelectItem value="fair" className="text-white hover:bg-purple-600/20">👌 Удовлетворительное</SelectItem>
                          <SelectItem value="poor" className="text-white hover:bg-purple-600/20">👎 Плохое</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="metadata.enchantment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Зачарование/Особые свойства
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Увеличивает силу, Светится в темноте..." 
                          {...field} 
                          className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Server Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <FormField
                control={form.control}
                name="serverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium text-lg">Сервер</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200">
                          <SelectValue placeholder="Выберите сервер" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-purple-500/30">
                        {servers.map((server: any) => (
                          <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-purple-600/20">
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

            {/* Listing Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 space-y-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-4">Детали объявления</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium">Название объявления</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Легендарный меч древних воинов" 
                        {...field} 
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
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
                    <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Ссылка на фото
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
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
                    <FormLabel className="text-purple-200 font-medium">Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Опишите историю сокровища, его магические свойства, легенды..." 
                        rows={4}
                        {...field} 
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200 resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium">Цена</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="1000000" 
                          {...field}
                          className="pr-12 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-300 font-semibold">₽</span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-600/10 hover:border-purple-400 transition-all duration-200"
                disabled={createListingMutation.isPending}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={createListingMutation.isPending} 
                className="flex-1 bg-gradient-to-r from-purple-600 via-amber-600 to-purple-600 hover:from-purple-700 hover:via-amber-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {createListingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  "Разместить объявление"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}