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
import { Fish, Waves, Weight, Ruler, Anchor, Target, Loader2 } from "lucide-react";

const createFishSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(3), // Только рыбалка
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    fishType: z.string().optional(),
    weight: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    location: z.string().optional(),
    bait: z.string().optional(),
  }).optional(),
});

type CreateFishFormData = z.infer<typeof createFishSchema>;

interface CreateFishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateFishModal({ open, onOpenChange }: CreateFishModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/categories", { parentId: 3 }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateFishFormData>({
    resolver: zodResolver(createFishSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 3,
      subcategoryId: undefined,
      serverId: 0,
      imageUrl: "", // Добавить эту строку
      metadata: {
        fishType: "",
        weight: 0,
        length: 0,
        location: "",
        bait: "",
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateFishFormData) => {
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
        description: "Ваше рыболовное объявление отправлено на модерацию",
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

  const onSubmit = (data: CreateFishFormData) => {
    createListingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 border-blue-500/20 text-white animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="text-center pb-8 relative">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-full animate-pulse" />
          
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 animate-pulse">
            <Fish className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">
            Рыболовное снаряжение
          </DialogTitle>
          <p className="text-blue-200/80 text-lg">Создайте объявление о продаже рыболовных товаров</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Category Selection */}
            {subcategories.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Категория товара
                </h3>
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200 font-medium">Тип товара</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200">
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-blue-500/30">
                          {subcategories.map((subcategory: any) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()} className="text-white hover:bg-blue-600/20">
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

            {/* Fish Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-semibold text-blue-300 mb-6 flex items-center gap-2">
                <Fish className="h-5 w-5" />
                Характеристики товара
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="metadata.fishType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200 font-medium flex items-center gap-2">
                        <Fish className="h-4 w-4" />
                        Тип рыбы/снаряжения
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Щука, Удочка, Катушка..." 
                          {...field} 
                          className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200 font-medium flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Вес (кг)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="2.5" 
                          {...field} 
                          className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200 font-medium flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Длина (см)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="45" 
                          {...field} 
                          className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200 font-medium flex items-center gap-2">
                        <Waves className="h-4 w-4" />
                        Место ловли
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Озеро, Река, Море..." 
                          {...field} 
                          className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="metadata.bait"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200 font-medium flex items-center gap-2">
                        <Anchor className="h-4 w-4" />
                        Приманка/Наживка
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Воблер, Червь, Блесна..." 
                          {...field} 
                          className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Server Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
              <FormField
                control={form.control}
                name="serverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200 font-medium text-lg">Сервер</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700/50 border-blue-500/30 text-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200">
                          <SelectValue placeholder="Выберите сервер" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-blue-500/30">
                        {servers.map((server: any) => (
                          <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-blue-600/20">
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
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 space-y-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">Детали объявления</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200 font-medium">Название объявления</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Профессиональная удочка для ловли щуки" 
                        {...field} 
                        className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
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
                    <FormLabel className="text-blue-200 font-medium flex items-center gap-2">
                      <Fish className="h-4 w-4" />
                      Ссылка на фото
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200" 
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
                    <FormLabel className="text-blue-200 font-medium">Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Опишите состояние снаряжения, особенности использования, результаты ловли..." 
                        rows={4}
                        {...field} 
                        className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 resize-none"
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
                    <FormLabel className="text-blue-200 font-medium">Цена</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field}
                          className="pr-12 bg-slate-700/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 font-semibold">₽</span>
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
                className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-600/10 hover:border-blue-400 transition-all duration-200"
                disabled={createListingMutation.isPending}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={createListingMutation.isPending} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
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