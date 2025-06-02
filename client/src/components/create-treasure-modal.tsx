import React, { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { TreasureStep1, TreasureStep2 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StepWizard from "@/components/step-wizard";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { ProductWithDetails } from "@/lib/types";
import type { Server } from "@shared/schema";

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
  const [formData, setFormData] = useState<Partial<CreateTreasureFormData>>({});
  const [stepsValidation, setStepsValidation] = useState<boolean[]>([false, false]);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const handleDataChange = (stepIndex: number, data: Partial<CreateTreasureFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleValidationChange = (stepIndex: number, isValid: boolean) => {
    setStepsValidation(prev => {
      const newValidation = [...prev];
      newValidation[stepIndex] = isValid;
      return newValidation;
    });
  };

  const handleComplete = async (data: CreateTreasureFormData) => {
    try {
      // Проверяем наличие всех обязательных полей
      if (!data.treasureType || !data.quantity || !data.description || !data.price || !data.serverId) {
        throw new Error("Пожалуйста, заполните все обязательные поля");
      }

      const productData = {
        title: `${data.treasureType} (${data.quantity} шт.)`,
        description: data.description,
        price: Math.round(data.price),
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
      
      const response = await apiRequest("POST", "/api/products", productData);
      let errorMessage;
      
      try {
        const responseData = await response.json();
        if (!response.ok) {
          errorMessage = responseData.message || "Не удалось создать объявление";
          throw new Error(errorMessage);
        }
        
        toast({
          title: "Объявление создано",
          description: "Ваше объявление о сокровище отправлено на модерацию",
        });
        onOpenChange(false);
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Ошибка при обработке ответа от сервера");
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
      throw error;
    }
  };

  const steps = [
    {
      id: "step1",
      title: "Основная информация",
      description: "Тип сокровища, количество, описание, цена и сервер",
      component: (
        <TreasureStep1 
          data={formData} 
          onDataChange={(data) => handleDataChange(0, data)} 
          onValidationChange={(isValid) => handleValidationChange(0, isValid)} 
          servers={servers} 
        />
      ),
      isValid: stepsValidation[0]
    },
    {
      id: "step2",
      title: "Изображение и контакты",
      description: "Ссылка на изображение и контактная информация",
      component: (
        <TreasureStep2 
          data={formData} 
          onDataChange={(data) => handleDataChange(1, data)} 
          onValidationChange={(isValid) => handleValidationChange(1, isValid)} 
        />
      ),
      isValid: stepsValidation[1]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <StepWizard<CreateTreasureFormData>
          steps={steps}
          onComplete={handleComplete}
          onCancel={() => onOpenChange(false)}
          category="treasure"
          defaultValues={formData}
        />
      </DialogContent>
    </Dialog>
  );
}