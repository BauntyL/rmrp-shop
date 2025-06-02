import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { TreasureStep1, TreasureStep2, TreasureStep3 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gem } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StepWizard from "@/components/step-wizard";

const createTreasureSchema = z.object({
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(4), // Только клады
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().optional(),
  metadata: z.object({
    treasureType: z.string().min(1, "Укажите тип клада"),
    quantity: z.coerce.number().min(1, "Количество должно быть больше 0"),
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    }),
  }),
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
        ...data,
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      
      const response = await apiRequest("POST", "/api/products", productData);
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

  const stepValidationSchemas = [
    // Step 1: Treasure type and quantity
    z.object({
      metadata: z.object({
        treasureType: z.string().min(1, "Укажите тип клада"),
        quantity: z.coerce.number().min(1, "Количество должно быть больше 0")
      })
    }),
    // Step 2: Description, photo and price
    z.object({
      description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
      price: z.coerce.number().min(1, "Цена должна быть больше 0"),
      imageUrl: z.string().optional()
    }),
    // Step 3: Contacts and server
    z.object({
      serverId: z.coerce.number().min(1, "Выберите сервер"),
      metadata: z.object({
        contacts: z.object({
          discord: z.string().optional(),
          telegram: z.string().optional(),
          phone: z.string().optional(),
        })
      })
    })
  ];

  const defaultValues: CreateTreasureFormData = {
    description: "",
    price: 0,
    categoryId: 4,
    serverId: 0,
    imageUrl: "",
    metadata: {
      treasureType: "",
      quantity: 1,
      contacts: {
        discord: "",
        telegram: "",
        phone: "",
      },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-amber-900 border-purple-500/20 text-white animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="relative z-10">
          <DialogHeader className="text-center pb-8 relative">
            {/* Decorative gradient line */}
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
                  component: TreasureStep1,
                  title: "Тип и количество",
                  description: "Укажите тип клада и количество предметов"
                },
                {
                  component: TreasureStep2,
                  title: "Описание и цена",
                  description: "Опишите клад, добавьте фото и укажите цену"
                },
                {
                  component: TreasureStep3,
                  title: "Контакты и сервер",
                  description: "Укажите контактную информацию и выберите сервер"
                }
              ]}
              validationSchemas={stepValidationSchemas}
              defaultValues={defaultValues}
              onComplete={handleComplete}
              onCancel={() => onOpenChange(false)}
              category="treasure"
              additionalProps={{ servers }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}