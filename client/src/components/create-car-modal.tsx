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
      const payload = {
        ...data,
        categoryId: 1, // Cars category
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      delete (payload as any).imageUrl;
      return apiRequest("POST", "/api/products", payload);
    },
    onSuccess: () => {
      toast({
        title: "Объявление создано",
        description: "Ваше объявление отправлено на модерацию",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
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

  const carCategories = [
    { value: "standard", label: "Стандарт" },
    { value: "coupe", label: "Купе" },
    { value: "suv", label: "Внедорожники" },
    { value: "sport", label: "Спорт" },
    { value: "motorcycle", label: "Мотоциклы" },
    { value: "special", label: "Специальные" },
  ];

  const tuningOptions = [
    { value: "none", label: "Без тюнинга" },
    { value: "ft", label: "FT" },
    { value: "fft", label: "FFT" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Разместить объявление об автомобиле</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="metadata.category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория автомобиля</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название автомобиля</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Гелик 63" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.maxSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Максимальная скорость (км/ч)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="250" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Сервер</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
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

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена (₽)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1000000" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите автомобиль..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка на фото</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.tuning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тюнинг</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип тюнинга" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tuningOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Способы связи</h3>
              
              <FormField
                control={form.control}
                name="metadata.contacts.discord"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord</FormLabel>
                    <FormControl>
                      <Input placeholder="user#0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.contacts.telegram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="@user" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.contacts.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер телефона</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 123 456 78 90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={createListingMutation.isPending}>
                {createListingMutation.isPending ? "Создание..." : "Создать объявление"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}