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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Car, Home, Fish, Gem, Package, Server, DollarSign, FileText, Sparkles, Loader2 } from "lucide-react";

const createListingSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.coerce.number().min(1, "Выберите категорию"),
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  metadata: z.object({}).optional(),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateListingModal({ open, onOpenChange }: CreateListingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/categories", { parentId: selectedCategory }],
    enabled: !!selectedCategory,
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 0,
      subcategoryId: undefined,
      serverId: 0,
      metadata: {},
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingFormData) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast.success("Объявление создано", "Ваше объявление отправлено на модерацию");
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast.error("Ошибка", error.message || "Не удалось создать объявление");
    },
  });

  const mainCategories = categories.filter((cat: any) => !cat.parentId);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "cars": return <Car className="h-5 w-5" />;
      case "realestate": return <Home className="h-5 w-5" />;
      case "fish": return <Fish className="h-5 w-5" />;
      case "treasures": return <Gem className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryGradient = (name: string) => {
    switch (name) {
      case "cars": return "from-red-500/20 to-orange-500/20 border-red-500/30";
      case "realestate": return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "fish": return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      case "treasures": return "from-purple-500/20 to-pink-500/20 border-purple-500/30";
      default: return "from-slate-500/20 to-gray-500/20 border-slate-500/30";
    }
  };

  const onSubmit = (data: CreateListingFormData) => {
    createListingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        
        {/* Floating Orbs */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-full blur-xl animate-float-delayed" />
        
        <div className="relative z-10">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Sparkles className="h-6 w-6 text-violet-400" />
              </div>
              Создать объявление
            </DialogTitle>
            <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Category Selection */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-white flex items-center gap-2">
                          <Package className="h-5 w-5 text-violet-400" />
                          Категория товара
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value?.toString()}
                            onValueChange={(value) => {
                              const categoryId = parseInt(value);
                              field.onChange(categoryId);
                              setSelectedCategory(categoryId);
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                          >
                            {mainCategories.map((category: any) => (
                              <div key={category.id} className="relative group">
                                <RadioGroupItem 
                                  value={category.id.toString()} 
                                  id={category.id.toString()} 
                                  className="sr-only" 
                                />
                                <Label 
                                  htmlFor={category.id.toString()} 
                                  className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                    field.value === category.id 
                                      ? `bg-gradient-to-r ${getCategoryGradient(category.name)} border-opacity-100` 
                                      : 'bg-slate-800/30 border-slate-600/50 hover:border-slate-500/70'
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg ${
                                    field.value === category.id 
                                      ? 'bg-white/10' 
                                      : 'bg-slate-700/50'
                                  }`}>
                                    {getCategoryIcon(category.name)}
                                  </div>
                                  <span className="font-medium text-white">{category.displayName}</span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subcategory Selection */}
                {selectedCategory && subcategories.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-fade-in">
                    <FormField
                      control={form.control}
                      name="subcategoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-purple-400" />
                            Подкатегория
                          </FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:border-purple-500/50 transition-colors">
                                <SelectValue placeholder="Выберите подкатегорию" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-700">
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

                {/* Server Selection */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <FormField
                    control={form.control}
                    name="serverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-white flex items-center gap-2">
                          <Server className="h-5 w-5 text-blue-400" />
                          Сервер
                        </FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:border-blue-500/50 transition-colors">
                              <SelectValue placeholder="Выберите сервер" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700">
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

                {/* Product Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    Детали товара
                  </h3>
                  
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Название товара</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Краткое описание товара" 
                            {...field} 
                            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Описание</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Подробное описание товара" 
                            rows={4}
                            {...field} 
                            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors resize-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-yellow-400" />
                          Цена
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-yellow-500/50 transition-colors pr-12"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-medium">₽</span>
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
                    className="flex-1 bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createListingMutation.isPending} 
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {createListingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Отправить на модерацию
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
