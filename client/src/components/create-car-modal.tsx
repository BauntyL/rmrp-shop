import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { CarStep1, CarStep2 } from "./steps";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StepWizard from "@/components/step-wizard";

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

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const handleComplete = async (data: CreateCarFormData) => {
    try {
      const productData = {
        name: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        serverId: data.serverId,
        images: data.imageUrl ? [data.imageUrl] : [],
        metadata: {
          carType: data.carType,
          contacts: data.contacts,
          imageUrl: data.imageUrl,
        },
      };
      
      await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      
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
      component: <CarStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} servers={servers} />,
      isValid: true
    },
    {
      id: "step2",
      title: "Характеристики и фото",
      description: "Тип автомобиля, цена и изображение",
      component: <CarStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
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