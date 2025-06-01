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
  categoryId: z.literal(4), // Только клады
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().optional(),
  metadata: z.object({
    treasureType: z.string().min(1, "Укажите тип клада"),
    quantity: z.coerce.number().min(1, "Количество должно быть больше 0"),
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    }),
  }),
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
      serverId: 0,
      imageUrl: "",
      metadata: {
        treasureType: "",
        quantity: 1,
        contacts: {
          discord: "",
          telegram: "",
          phone: "",
        },
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateTreasureFormData) => {
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
        description: "Ваше объявление о кладе отправлено на модерацию",
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
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 rounded-full animate-pulse" />
          
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 animate-pulse">
            <Gem className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent mb-2">
            Клады на продажу
          </DialogTitle>
          <p className="text-purple-200/80 text-lg">Создайте объявление о продаже клада</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Тип клада */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                <Gem className="h-5 w-5" />
                Клады на продажу
              </h3>
              <FormField
                control={form.control}
                name="metadata.treasureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium">Тип клада</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Введите тип клада (например: Золотые монеты, Драгоценности, Артефакты)" 
                        {...field} 
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Quantity */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Количество
              </h3>
              <FormField
                control={form.control}
                name="metadata.quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Количество предметов (шт.)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="1" 
                        {...field} 
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-300 mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Контактная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="metadata.contacts.discord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Discord
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="username#1234" 
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
                  name="metadata.contacts.telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Telegram
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="@username" 
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
                  name="metadata.contacts.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200 font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Телефон
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+7 (999) 123-45-67" 
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
                        placeholder="Древние золотые монеты" 
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
                      <Gem className="h-4 w-4" />
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
                        placeholder="Опишите клад: что входит в состав, история находки, состояние..." 
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
                          placeholder="50000" 
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
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