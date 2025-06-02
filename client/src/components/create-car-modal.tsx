import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StepWizard } from "./step-wizard";
import { CarStep1, CarStep2, CarStep3 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Car } from "lucide-react";
import { z } from "zod";

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
      
      toast.success("Объявление создано", "Ваше объявление об автомобиле отправлено на модерацию");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error: any) {
      toast.error("Ошибка", error.message || "Не удалось создать объявление");
      throw error;
    }
  };

  const stepValidationSchemas = [
    // Step 1: Category and basic info
    z.object({
      metadata: z.object({
        category: z.enum(["standard", "coupe", "suv", "sport", "motorcycle", "special"], {
          required_error: "Выберите категорию автомобиля"
        })
      }),
      title: z.string().min(1, "Название автомобиля обязательно")
    }),
    // Step 2: Details, tuning and price
    z.object({
      description: z.string().min(1, "Описание обязательно"),
      price: z.number().min(1, "Цена должна быть больше 0"),
      metadata: z.object({
        maxSpeed: z.number().min(1, "Максимальная скорость должна быть больше 0"),
        tuning: z.enum(["none", "ft", "fft"], {
          required_error: "Выберите тип тюнинга"
        })
      }),
      imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal(""))
    }),
    // Step 3: Contacts and server
    z.object({
      serverId: z.number().min(1, "Выберите сервер"),
      metadata: z.object({
        contacts: z.object({
          discord: z.string().optional(),
          telegram: z.string().optional(),
          phone: z.string().optional(),
        })
      })
    })
  ];

  const defaultValues: CreateCarFormData = {
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
                  component: CarStep1,
                  title: "Категория и название",
                  description: "Выберите тип автомобиля и укажите название"
                },
                {
                  component: CarStep2,
                  title: "Детали и тюнинг",
                  description: "Опишите автомобиль, укажите характеристики и цену"
                },
                {
                  component: CarStep3,
                  title: "Контакты и сервер",
                  description: "Укажите контактную информацию и выберите сервер"
                }
              ]}
              validationSchemas={stepValidationSchemas}
              defaultValues={defaultValues}
              onComplete={handleComplete}
              onCancel={onClose}
              category="car"
              additionalProps={{ servers }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}