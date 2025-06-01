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
import { Gem, Star, Crown, Sparkles } from "lucide-react";

const createTreasureSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(4), // Только сокровища
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
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
      const response = await apiRequest("POST", "/api/products", data);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <Gem className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">Продать сокровище</DialogTitle>
          <p className="text-purple-600">Создайте объявление о продаже редкого сокровища</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Subcategory Selection */}
            {subcategories.length > 0 && (
              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-900 font-semibold">Тип сокровища</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="border-purple-200 focus:border-purple-500">
                          <SelectValue placeholder="Выберите тип сокровища" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcategory: any) => (
                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                            {subcategory.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Treasure Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-900 font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Редкость
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-purple-200 focus:border-purple-500">
                          <SelectValue placeholder="Выберите редкость" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="common">Обычное</SelectItem>
                        <SelectItem value="uncommon">Необычное</SelectItem>
                        <SelectItem value="rare">Редкое</SelectItem>
                        <SelectItem value="epic">Эпическое</SelectItem>
                        <SelectItem value="legendary">Легендарное</SelectItem>
                        <SelectItem value="mythic">Мифическое</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-900 font-semibold flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Материал
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Золото, Серебро, Платина..." {...field} className="border-purple-200 focus:border-purple-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-900 font-semibold">Происхождение</FormLabel>
                    <FormControl>
                      <Input placeholder="Древний храм, Пиратский клад..." {...field} className="border-purple-200 focus:border-purple-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-900 font-semibold">Состояние</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-purple-200 focus:border-purple-500">
                          <SelectValue placeholder="Выберите состояние" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="perfect">Идеальное</SelectItem>
                        <SelectItem value="excellent">Отличное</SelectItem>
                        <SelectItem value="good">Хорошее</SelectItem>
                        <SelectItem value="fair">Удовлетворительное</SelectItem>
                        <SelectItem value="poor">Плохое</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metadata.enchantment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Зачарование/Особые свойства
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Увеличивает силу, Светится в темноте..." {...field} className="border-purple-200 focus:border-purple-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Server Selection */}
            <FormField
              control={form.control}
              name="serverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 font-semibold">Сервер</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue placeholder="Выберите сервер" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {servers.map((server: any) => (
                        <SelectItem key={server.id} value={server.id.toString()}>
                          {server.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 font-semibold">Название объявления</FormLabel>
                  <FormControl>
                    <Input placeholder="Легендарный меч древних воинов" {...field} className="border-purple-200 focus:border-purple-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 font-semibold">Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите историю сокровища, его магические свойства, легенды..." 
                      rows={4}
                      {...field} 
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-900 font-semibold">Цена</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="1000000" 
                        {...field}
                        className="pr-8 border-purple-200 focus:border-purple-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 font-semibold">₽</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                Отмена
              </Button>
              <Button type="submit" disabled={createListingMutation.isPending} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {createListingMutation.isPending ? "Создание..." : "Разместить объявление"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}