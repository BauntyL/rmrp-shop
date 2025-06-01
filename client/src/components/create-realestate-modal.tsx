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
import { Home, MapPin, Ruler, Bed, Building, Layers, X, Sparkles } from "lucide-react";

const createRealEstateSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(2), // Только недвижимость
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  metadata: z.object({
    area: z.coerce.number().optional(),
    rooms: z.coerce.number().optional(),
    floor: z.coerce.number().optional(),
    totalFloors: z.coerce.number().optional(),
    address: z.string().optional(),
  }).optional(),
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
      subcategoryId: undefined,
      serverId: 0,
      metadata: {
        area: 0,
        rooms: 0,
        floor: 0,
        totalFloors: 0,
        address: "",
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateRealEstateFormData) => {
      const response = await apiRequest("POST", "/api/products", data);
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
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 animate-pulse">
            <Home className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
            Продать недвижимость
          </DialogTitle>
          <p className="text-slate-400 text-lg mt-2">
            Создайте объявление о продаже вашей недвижимости
          </p>
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-600 mx-auto mt-4 rounded-full"></div>
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
                      <FormLabel className="text-emerald-400 font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Тип недвижимости
                      </FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20 h-12">
                            <SelectValue placeholder="Выберите тип недвижимости" />
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

            {/* Property Details Grid */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xl font-semibold text-emerald-400 mb-6 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Характеристики недвижимости
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="metadata.area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-emerald-400" />
                        Площадь (м²)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="85" 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                        <Bed className="h-4 w-4 text-emerald-400" />
                        Количество комнат
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3" 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-emerald-400" />
                        Этаж
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.totalFloors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-400" />
                        Этажность дома
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12" 
                          {...field} 
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="metadata.address"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      Адрес
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ул. Пушкина, д. 10, кв. 25" 
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12" 
                      />
                    </FormControl>
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
                    <FormLabel className="text-emerald-400 font-semibold text-lg">Сервер</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500/20 h-12">
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
                    <FormLabel className="text-emerald-400 font-semibold text-lg">Название объявления</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="3-комнатная квартира в центре города" 
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12" 
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
                    <FormLabel className="text-emerald-400 font-semibold text-lg">Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробно опишите недвижимость: состояние, ремонт, инфраструктуру, транспортную доступность..." 
                        rows={5}
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
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
                    <FormLabel className="text-emerald-400 font-semibold text-lg">Цена</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="5500000" 
                          {...field}
                          className="pr-12 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-12 text-lg"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 font-bold text-lg">₽</span>
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
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white h-12 text-lg font-medium shadow-lg shadow-emerald-500/25 transition-all duration-200"
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