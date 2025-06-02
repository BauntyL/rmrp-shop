import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { CarStep1, CarStep2 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Car } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StepWizard from "@/components/step-wizard";

const createCarSchema = z.object({
  title: z.string().min(1, "Название автомобиля обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  price: z.number().min(1, "Цена должна быть больше 0"),
  serverId: z.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    // Step 1 - Основная информация
    brand: z.string().min(1, "Марка обязательна"),
    model: z.string().min(1, "Модель обязательна"),
    year: z.number().min(1900, "Некорректный год").max(new Date().getFullYear() + 1, "Некорректный год"),
    category: z.enum(["sedan", "hatchback", "suv", "coupe", "wagon", "convertible", "pickup", "van", "motorcycle"], {
      required_error: "Выберите категорию автомобиля"
    }),
    
    // Step 2 - Детали автомобиля
    engineType: z.string().min(1, "Тип двигателя обязателен"),
    engineVolume: z.number().min(0.1, "Объем двигателя должен быть больше 0"),
    horsepower: z.number().min(1, "Мощность должна быть больше 0"),
    transmission: z.enum(["manual", "automatic", "cvt", "robot"], {
      required_error: "Выберите тип коробки передач"
    }),
    driveType: z.enum(["front", "rear", "all"], {
      required_error: "Выберите тип привода"
    }),
    fuelType: z.enum(["gasoline", "diesel", "hybrid", "electric", "gas"], {
      required_error: "Выберите тип топлива"
    }),
    mileage: z.number().min(0, "Пробег не может быть отрицательным"),
    condition: z.enum(["new", "excellent", "good", "fair", "poor"], {
      required_error: "Выберите состояние автомобиля"
    }),
    color: z.string().min(1, "Цвет обязателен"),
    
    // Step 3 - Контакты
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    }).refine(data => data.discord || data.telegram || data.phone, {
      message: "Необходимо указать хотя бы один способ связи"
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

  const handleComplete = async (data: CreateCarFormData) => {
    try {
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: 1, // Cars category
        serverId: data.serverId,
        images: data.imageUrl ? [data.imageUrl] : [],
        metadata: data.metadata
      };
      
      const response = await apiRequest("POST", "/api/products", productData);
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше объявление об автомобиле отправлено на модерацию",
      });
      onClose();
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

  const defaultValues: CreateCarFormData = {
    title: "",
    description: "",
    price: 0,
    serverId: 0,
    imageUrl: "",
    metadata: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      category: "sedan",
      engineType: "",
      engineVolume: 0,
      horsepower: 0,
      transmission: "manual",
      driveType: "front",
      fuelType: "gasoline",
      mileage: 0,
      condition: "good",
      color: "",
      contacts: {
        discord: "",
        telegram: "",
        phone: "",
      }
    }
  };

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

          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <StepWizard
              steps={[
                {
                  component: <CarStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} servers={servers} />,
                  title: "Основная информация",
                  description: "Данные об автомобиле, характеристики и цена",
                  isValid: true
                },
                {
                  component: <CarStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
                  title: "Изображение и контакты",
                  description: "Фото автомобиля и контактная информация",
                  isValid: true
                }
              ]}
              defaultValues={defaultValues}
              onComplete={handleComplete}
              onCancel={onClose}
              category="car"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { CarStep1, CarStep2 } from "./steps";