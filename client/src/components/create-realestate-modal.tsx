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
import { Home, MapPin, Ruler, Bed } from "lucide-react";

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-green-50 to-emerald-50">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-green-900">Продать недвижимость</DialogTitle>
          <p className="text-green-600">Создайте объявление о продаже недвижимости</p>
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
                    <FormLabel className="text-green-900 font-semibold">Тип недвижимости</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="border-green-200 focus:border-green-500">
                          <SelectValue placeholder="Выберите тип недвижимости" />
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

            {/* Property Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-900 font-semibold flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Площадь (м²)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="85" {...field} className="border-green-200 focus:border-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-900 font-semibold flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Количество комнат
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3" {...field} className="border-green-200 focus:border-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-900 font-semibold">Этаж</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} className="border-green-200 focus:border-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.totalFloors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-900 font-semibold">Всего этажей</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="9" {...field} className="border-green-200 focus:border-green-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metadata.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-green-900 font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Адрес
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ул. Примерная, д. 123" {...field} className="border-green-200 focus:border-green-500" />
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
                  <FormLabel className="text-green-900 font-semibold">Сервер</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="border-green-200 focus:border-green-500">
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
                  <FormLabel className="text-green-900 font-semibold">Название объявления</FormLabel>
                  <FormControl>
                    <Input placeholder="3-комнатная квартира в центре города" {...field} className="border-green-200 focus:border-green-500" />
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
                  <FormLabel className="text-green-900 font-semibold">Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите особенности недвижимости, состояние, инфраструктуру района..." 
                      rows={4}
                      {...field} 
                      className="border-green-200 focus:border-green-500"
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
                  <FormLabel className="text-green-900 font-semibold">Цена</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="5000000" 
                        {...field}
                        className="pr-8 border-green-200 focus:border-green-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₽</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                Отмена
              </Button>
              <Button type="submit" disabled={createListingMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                {createListingMutation.isPending ? "Создание..." : "Разместить объявление"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}