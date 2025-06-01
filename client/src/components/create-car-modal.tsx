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
import { Car, Gauge, Fuel, Calendar, Sparkles, X } from "lucide-react";

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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        {/* Header with close button */}
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogHeader className="text-center pb-8 pt-6">
          {/* Animated icon with gradient background */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 animate-pulse">
            <Car className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Продать автомобиль
          </DialogTitle>
          <p className="text-slate-400 text-lg mt-2">
            Создайте объявление о продаже вашего автомобиля
          </p>
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mt-4 rounded-full"></div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Subcategory Selection */}
            {subcategories.length > 0 && (
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-400 font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Тип автомобиля
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 h-12">
                            <SelectValue placeholder="Выберите тип автомобиля" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {subcategories.map((subcategory: any) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()} className="text-white hover:bg-slate-700">
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

            {/* Car Details Grid */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xl font-semibold text-blue-400 mb-6 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Характеристики автомобиля
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="metadata.brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium">Марка</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="BMW, Mercedes, Toyota..." 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium">Модель</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="X5, E-Class, Camry..." 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        Год выпуска
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2020" 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-blue-400" />
                        Пробег (км)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="metadata.fuelType"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-blue-400" />
                      Тип топлива
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 h-12">
                          <SelectValue placeholder="Выберите тип топлива" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="gasoline" className="text-white hover:bg-slate-700">Бензин</SelectItem>
                        <SelectItem value="diesel" className="text-white hover:bg-slate-700">Дизель</SelectItem>
                        <SelectItem value="electric" className="text-white hover:bg-slate-700">Электричество</SelectItem>
                        <SelectItem value="hybrid" className="text-white hover:bg-slate-700">Гибрид</SelectItem>
                        <SelectItem value="gas" className="text-white hover:bg-slate-700">Газ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Server Selection */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <FormField
                control={form.control}
                name="serverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400 font-semibold text-lg">Сервер</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 h-12">
                          <SelectValue placeholder="Выберите сервер" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {servers.map((server: any) => (
                          <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-slate-700">
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

            {/* Title and Description */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400 font-semibold text-lg">Название объявления</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="BMW X5 2020 года в отличном состоянии" 
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12" 
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
                    <FormLabel className="text-blue-400 font-semibold text-lg">Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробно опишите состояние автомобиля, комплектацию, историю обслуживания..." 
                        rows={5}
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Price */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-400 font-semibold text-lg">Цена</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="1500000" 
                          {...field}
                          className="pr-12 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-lg"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 font-bold text-lg">₽</span>
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
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white h-12 text-lg font-medium"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={createListingMutation.isPending} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 text-lg font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
              >
                {createListingMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Создание...
                  </div>
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