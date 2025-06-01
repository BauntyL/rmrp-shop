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
import { Car, Gauge, Fuel, Calendar } from "lucide-react";

const createCarSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(1), // Только автомобили
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  metadata: z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.coerce.number().optional(),
    mileage: z.coerce.number().optional(),
    fuelType: z.string().optional(),
  }).optional(),
});

type CreateCarFormData = z.infer<typeof createCarSchema>;

interface CreateCarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCarModal({ open, onOpenChange }: CreateCarModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/categories", { parentId: 1 }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateCarFormData>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 1,
      subcategoryId: undefined,
      serverId: 0,
      metadata: {
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        mileage: 0,
        fuelType: "",
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateCarFormData) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление создано",
        description: "Ваше объявление об автомобиле отправлено на модерацию",
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

  const onSubmit = (data: CreateCarFormData) => {
    createListingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-blue-900">Продать автомобиль</DialogTitle>
          <p className="text-blue-600">Создайте объявление о продаже вашего автомобиля</p>
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
                    <FormLabel className="text-blue-900 font-semibold">Тип автомобиля</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500">
                          <SelectValue placeholder="Выберите тип автомобиля" />
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

            {/* Car Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-semibold">Марка</FormLabel>
                    <FormControl>
                      <Input placeholder="BMW, Mercedes, Toyota..." {...field} className="border-blue-200 focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-semibold">Модель</FormLabel>
                    <FormControl>
                      <Input placeholder="X5, E-Class, Camry..." {...field} className="border-blue-200 focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Год выпуска
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2020" {...field} className="border-blue-200 focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-semibold flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Пробег (км)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50000" {...field} className="border-blue-200 focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metadata.fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900 font-semibold flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    Тип топлива
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500">
                        <SelectValue placeholder="Выберите тип топлива" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gasoline">Бензин</SelectItem>
                      <SelectItem value="diesel">Дизель</SelectItem>
                      <SelectItem value="electric">Электричество</SelectItem>
                      <SelectItem value="hybrid">Гибрид</SelectItem>
                      <SelectItem value="gas">Газ</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel className="text-blue-900 font-semibold">Сервер</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="border-blue-200 focus:border-blue-500">
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
                  <FormLabel className="text-blue-900 font-semibold">Название объявления</FormLabel>
                  <FormControl>
                    <Input placeholder="BMW X5 2020 года в отличном состоянии" {...field} className="border-blue-200 focus:border-blue-500" />
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
                  <FormLabel className="text-blue-900 font-semibold">Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Подробно опишите состояние автомобиля, комплектацию, историю обслуживания..." 
                      rows={4}
                      {...field} 
                      className="border-blue-200 focus:border-blue-500"
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
                  <FormLabel className="text-blue-900 font-semibold">Цена</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="1500000" 
                        {...field}
                        className="pr-8 border-blue-200 focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-semibold">₽</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                Отмена
              </Button>
              <Button type="submit" disabled={createListingMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {createListingMutation.isPending ? "Создание..." : "Разместить объявление"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}