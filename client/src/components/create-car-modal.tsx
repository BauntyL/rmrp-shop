import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Car, Server, DollarSign, FileText, Sparkles, Loader2, Gauge, Settings, Phone, MessageCircle, Users } from "lucide-react";

const createCarSchema = z.object({
  title: z.string().min(1, "Название автомобиля обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  price: z.number().min(1, "Цена должна быть больше 0"),
  serverId: z.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    category: z.enum(["standard", "coupe", "suv", "sport", "motorcycle", "special"], {
      required_error: "Выберите категорию автомобиля"
    }),
    maxSpeed: z.number().min(1, "Максимальная скорость должна быть больше 0"),
    tuning: z.enum(["none", "ft", "fft"], {
      required_error: "Выберите тип тюнинга"
    }),
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    })
  })
});

type CreateCarFormData = z.infer<typeof createCarSchema>;

interface CreateCarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCarModal({ isOpen, onClose }: CreateCarModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateCarFormData>({
    resolver: zodResolver(createCarSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      serverId: 0,
      imageUrl: "",
      metadata: {
        category: "standard",
        maxSpeed: 0,
        tuning: "none",
        contacts: {
          discord: "",
          telegram: "",
          phone: "",
        }
      }
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateCarFormData) => {
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: 1, // Cars category
        serverId: data.serverId,
        images: data.imageUrl ? [data.imageUrl] : [], // Convert imageUrl to images array
        metadata: data.metadata
      };
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast.success("Объявление создано", "Ваше объявление об автомобиле отправлено на модерацию");
      form.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast.error("Ошибка", error.message || "Не удалось создать объявление");
    },
  });

  const onSubmit = (data: CreateCarFormData) => {
    createListingMutation.mutate(data);
  };

  const carCategories = [
    { value: "standard", label: "Стандарт", icon: "🚗", gradient: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
    { value: "coupe", label: "Купе", icon: "🏎️", gradient: "from-red-500/20 to-orange-500/20 border-red-500/30" },
    { value: "suv", label: "Внедорожники", icon: "🚙", gradient: "from-green-500/20 to-emerald-500/20 border-green-500/30" },
    { value: "sport", label: "Спорт", icon: "🏁", gradient: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
    { value: "motorcycle", label: "Мотоциклы", icon: "🏍️", gradient: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" },
    { value: "special", label: "Специальные", icon: "🚛", gradient: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30" },
  ];

  const tuningOptions = [
    { value: "none", label: "Без тюнинга", icon: "🔧" },
    { value: "ft", label: "FT", icon: "⚡" },
    { value: "fft", label: "FFT", icon: "🔥" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-yellow-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        
        {/* Floating Orbs */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full blur-xl animate-float-delayed" />
        
        <div className="relative z-10">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
                <Car className="h-6 w-6 text-red-400" />
              </div>
              Разместить объявление об автомобиле
            </DialogTitle>
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Car Category Selection */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <FormField
                    control={form.control}
                    name="metadata.category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-white flex items-center gap-2">
                          <Car className="h-5 w-5 text-red-400" />
                          Категория автомобиля
                        </FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {carCategories.map((category) => (
                            <div
                              key={category.value}
                              onClick={() => field.onChange(category.value)}
                              className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                field.value === category.value
                                  ? `bg-gradient-to-r ${category.gradient} border-opacity-100`
                                  : 'bg-slate-800/30 border-slate-600/50 hover:border-slate-500/70'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-2">{category.icon}</div>
                                <span className="font-medium text-white text-sm">{category.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Car Details */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    Детали автомобиля
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Название автомобиля</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Например: Гелик 63" 
                            {...field} 
                            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="metadata.maxSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-blue-400" />
                            Максимальная скорость
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="250" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 transition-colors pr-16"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 font-medium">км/ч</span>
                            </div>
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
                                onChange={(e) => field.onChange(Number(e.target.value))}
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Описание</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Подробное описание автомобиля" 
                            rows={4}
                            {...field} 
                            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors resize-none"
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
                        <FormLabel className="text-white font-medium">Ссылка на фото</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/photo.jpg" 
                            {...field} 
                            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tuning & Server */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tuning Selection */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <FormField
                      control={form.control}
                      name="metadata.tuning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-white flex items-center gap-2">
                            <Settings className="h-5 w-5 text-purple-400" />
                            Тюнинг
                          </FormLabel>
                          <div className="grid grid-cols-1 gap-3 mt-4">
                            {tuningOptions.map((option) => (
                              <div
                                key={option.value}
                                onClick={() => field.onChange(option.value)}
                                className={`cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                                  field.value === option.value
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50'
                                    : 'bg-slate-800/30 border-slate-600/50 hover:border-slate-500/70'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{option.icon}</span>
                                  <span className="font-medium text-white">{option.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

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
                          <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
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
                </div>

                {/* Contact Information */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-cyan-400" />
                    Контактная информация
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="metadata.contacts.discord"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-indigo-400" />
                            Discord
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="user#0000" 
                              {...field} 
                              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-indigo-500/50 transition-colors"
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
                          <FormLabel className="text-white font-medium flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-400" />
                            Telegram
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="@user" 
                              {...field} 
                              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 transition-colors"
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
                          <FormLabel className="text-white font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-400" />
                            Номер телефона
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+7 123 456 78 90" 
                              {...field} 
                              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500/50 transition-colors"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="flex-1 bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createListingMutation.isPending} 
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {createListingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Создать объявление
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