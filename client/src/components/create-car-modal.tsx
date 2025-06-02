import React, { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { CarStep1, CarStep2 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StepWizard from "@/components/step-wizard";
import type { Server } from "@shared/schema";

const createCarSchema = z.object({
  // Шаг 1: Основная информация
  title: z.string().min(1, "Название автомобиля обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  serverId: z.number().min(1, "Выберите сервер"),
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
  
  // Шаг 2: Характеристики автомобиля
  price: z.number().min(1, "Цена должна быть больше 0"),
  carType: z.string().min(1, "Выберите тип автомобиля"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  
  // Системные поля
  categoryId: z.literal(1), // Автомобили
});

type CreateCarFormData = z.infer<typeof createCarSchema>;

interface CreateCarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCarModal({ isOpen, onClose }: CreateCarModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<CreateCarFormData>>({});
  const [stepsValidation, setStepsValidation] = useState<boolean[]>([false, false]);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const handleDataChange = (stepIndex: number, data: Partial<CreateCarFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleValidationChange = (stepIndex: number, isValid: boolean) => {
    setStepsValidation(prev => {
      const newValidation = [...prev];
      newValidation[stepIndex] = isValid;
      return newValidation;
    });
  };

  const handleComplete = async (data: CreateCarFormData) => {
    try {
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: 1, // Автомобили
        serverId: data.serverId,
        images: data.imageUrl ? [data.imageUrl] : [],
        metadata: {
          carType: data.carType,
          contacts: data.contacts,
          imageUrl: data.imageUrl,
        },
      };
      
      const response = await apiRequest("POST", "/api/products", productData);
      await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "🎉 Успешно!",
        description: "Объявление создано и отправлено на модерацию",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "❌ Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
    }
  };

  const steps = [
    {
      id: "step1",
      title: "Основная информация",
      description: "Данные об автомобиле и контакты",
      component: (
        <CarStep1 
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
      title: "Характеристики и фото",
      description: "Тип автомобиля, цена и изображение",
      component: (
        <CarStep2 
          data={formData} 
          onDataChange={(data) => handleDataChange(1, data)} 
          onValidationChange={(isValid) => handleValidationChange(1, isValid)} 
        />
      ),
      isValid: stepsValidation[1]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <StepWizard
          steps={steps}
          onComplete={handleComplete}
          onCancel={onClose}
          category="car"
        />
      </DialogContent>
    </Dialog>
  );
}