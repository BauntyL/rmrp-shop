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
import { Fish, Waves, Weight, Ruler } from "lucide-react";

const createFishSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(3), // Только рыбалка
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
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
      const response = await apiRequest("POST", "/api/products", data);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-50 to-blue-50">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mb-4">
            <Fish className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-cyan-900">Рыболовное снаряжение</DialogTitle>
          <p className="text-cyan-600">Создайте объявление о продаже рыболовных товаров</p>
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
                    <FormLabel className="text-cyan-900 font-semibold">Категория товара</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="border-cyan-200 focus:border-cyan-500">
                          <SelectValue placeholder="Выберите категорию" />
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

            {/* Fish Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.fishType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-900 font-semibold">Тип рыбы/снаряжения</FormLabel>
                    <FormControl>
                      <Input placeholder="Щука, Удочка, Катушка..." {...field} className="border-cyan-200 focus:border-cyan-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-900 font-semibold flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Вес (кг)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="2.5" {...field} className="border-cyan-200 focus:border-cyan-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-900 font-semibold flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Длина (см)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="45" {...field} className="border-cyan-200 focus:border-cyan-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-900 font-semibold flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      Место ловли
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Озеро, Река, Море..." {...field} className="border-cyan-200 focus:border-cyan-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metadata.bait"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-900 font-semibold">Приманка/Наживка</FormLabel>
                  <FormControl>
                    <Input placeholder="Воблер, Червь, Блесна..." {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                  <FormLabel className="text-cyan-900 font-semibold">Сервер</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="border-cyan-200 focus:border-cyan-500">
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
                  <FormLabel className="text-cyan-900 font-semibold">Название объявления</FormLabel>
                  <FormControl>
                    <Input placeholder="Профессиональная удочка для ловли щуки" {...field} className="border-cyan-200 focus:border-cyan-500" />
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
                  <FormLabel className="text-cyan-900 font-semibold">Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите состояние снаряжения, особенности использования, результаты ловли..." 
                      rows={4}
                      {...field} 
                      className="border-cyan-200 focus:border-cyan-500"
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
                  <FormLabel className="text-cyan-900 font-semibold">Цена</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        {...field}
                        className="pr-8 border-cyan-200 focus:border-cyan-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600 font-semibold">₽</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                Отмена
              </Button>
              <Button type="submit" disabled={createListingMutation.isPending} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                {createListingMutation.isPending ? "Создание..." : "Разместить объявление"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}