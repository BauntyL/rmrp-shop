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
  // Основная информация
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  categoryId: z.literal(4), // Только клады
  
  // Детали клада
  treasureType: z.string().min(1, "Укажите тип клада"),
  quantity: z.coerce.number().min(1, "Количество должно быть больше 0"),
  rarity: z.string().min(1, "Укажите редкость"),
  condition: z.string().min(1, "Укажите состояние"),
  
  // Контакты, цена и сервер
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
  contact: z.string().optional(),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  location: z.string().min(1, "Укажите местоположение"),
  images: z.array(z.any()).optional(),
  additionalInfo: z.string().optional(),
  notes: z.string().optional(),
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
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        serverId: data.serverId,
        images: data.images || [],
        metadata: {
          treasureType: data.treasureType,
          quantity: data.quantity,
          rarity: data.rarity,
          condition: data.condition,
          contacts: data.contacts,
          location: data.location,
          additionalInfo: data.additionalInfo,
          notes: data.notes,
        },
      };
      
      const response = await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о кладе отправлено на модерацию",
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
    name: "",
    description: "",
    categoryId: 4,
    treasureType: "",
    quantity: 1,
    rarity: "",
    condition: "",
    contacts: {
      discord: "",
      telegram: "",
      phone: "",
    },
    contact: "",
    price: 0,
    serverId: 0,
    location: "",
    images: [],
    additionalInfo: "",
    notes: "",
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