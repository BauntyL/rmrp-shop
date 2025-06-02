import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { TreasureStep1, TreasureStep2 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gem } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StepWizard from "@/components/step-wizard";

const createTreasureSchema = z.object({
  // Шаг 1: Основная информация
  treasureType: z.string().min(1, "Укажите тип сокровища"),
  quantity: z.coerce.number().min(1, "Количество должно быть больше 0"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  
  // Шаг 2: Изображение и контакты
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  contacts: z.object({
    discord: z.string().optional(),
    telegram: z.string().optional(),
    phone: z.string().optional(),
  }).refine(
    (data) => data.discord || data.telegram || data.phone,
    {
      message: "Укажите хотя бы один способ связи",
      path: ["contacts"]
    }
  ),
  
  // Системные поля
  categoryId: z.literal(4), // Только клады
  name: z.string().default("Сокровище"), // Автоматически генерируется
});

type CreateTreasureFormData = z.infer<typeof createTreasureSchema>;

interface CreateTreasureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTreasureModal({ open, onOpenChange }: CreateTreasureModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const handleComplete = async (data: CreateTreasureFormData) => {
    try {
      const productData = {
        name: `${data.treasureType} (${data.quantity} шт.)`,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        serverId: data.serverId,
        images: data.imageUrl ? [data.imageUrl] : [],
        metadata: {
          treasureType: data.treasureType,
          quantity: data.quantity,
          contacts: data.contacts,
          imageUrl: data.imageUrl,
        },
      };
      
      const response = await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о сокровище отправлено на модерацию",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
      throw error;
    }
  };

  const defaultValues: CreateTreasureFormData = {
    treasureType: "",
    quantity: 1,
    description: "",
    price: 0,
    serverId: 0,
    imageUrl: "",
    contacts: {
      discord: "",
      telegram: "",
      phone: "",
    },
    categoryId: 4,
    name: "Сокровище",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-amber-900 border-purple-500/20 text-white animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="relative z-10">
          <DialogHeader className="text-center pb-8 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 rounded-full animate-pulse" />
            
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 animate-pulse">
              <Gem className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent mb-2">
              Клады на продажу
            </DialogTitle>
            <p className="text-purple-200/80 text-lg">Создайте объявление о продаже клада</p>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <StepWizard
              steps={[
                {
                  component: <TreasureStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} servers={servers} />,
                  title: "Основная информация и детали",
                  description: "Название, описание, тип клада, цена и сервер",
                  isValid: true
                },
                {
                  component: <TreasureStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
                  title: "Изображения и контакты",
                  description: "Фотографии и контактная информация",
                  isValid: true
                }
              ]}
              defaultValues={defaultValues}
              onComplete={handleComplete}
              onCancel={() => onOpenChange(false)}
              category="treasure"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}