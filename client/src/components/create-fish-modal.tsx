import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StepWizard from './step-wizard';
import { FishStep1, FishStep2, FishStep3 } from './steps';

const createFishSchema = z.object({
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(3), // Только рыба
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().optional(),
  metadata: z.object({
    fishType: z.string().min(1, "Укажите тип рыбы"),
    quantity: z.coerce.number().min(1, "Количество должно быть больше 0"),
    species: z.string().optional(),
    weight: z.string().optional(),
    length: z.string().optional(),
    catchMethod: z.string().optional(),
    bait: z.string().optional(),
    weatherConditions: z.string().optional(),
    waterTemperature: z.string().optional(),
    notes: z.string().optional(),
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    }),
  }),
});

type CreateFishFormData = z.infer<typeof createFishSchema>;

interface CreateFishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateFishModal({ open, onOpenChange }: CreateFishModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const handleComplete = async (formData: any) => {
    try {
      const apiData: CreateFishFormData = {
        description: formData.description || '',
        price: formData.price || 0,
        categoryId: 3,
        serverId: formData.serverId || 0,
        imageUrl: formData.imageUrl || '',
        metadata: {
          fishType: formData.fishType || '',
          quantity: formData.quantity || 1,
          species: formData.species || '',
          weight: formData.weight || '',
          length: formData.length || '',
          catchMethod: formData.catchMethod || '',
          bait: formData.bait || '',
          weatherConditions: formData.weatherConditions || '',
          waterTemperature: formData.waterTemperature || '',
          notes: formData.notes || '',
          contacts: {
            discord: formData.discord || '',
            telegram: formData.telegram || '',
            phone: formData.phone || '',
          },
        },
      };

      const productData = {
        ...apiData,
        images: apiData.imageUrl ? [apiData.imageUrl] : [],
        title: `${formData.fishType} (${formData.quantity} шт.)`,
        userId: user?.id,
      };

      await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Успех!",
        description: "Объявление о рыбе создано успешно",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Ошибка создания объявления:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
    }
  };

  const steps = [
    {
      component: FishStep1,
      title: "Основная информация",
      description: "Тип рыбы, количество и базовая информация"
    },
    {
      component: FishStep2,
      title: "Детали и характеристики",
      description: "Подробные характеристики улова"
    },
    {
      component: FishStep3,
      title: "Контакты, цена и сервер",
      description: "Контактная информация, цена и выбор сервера"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <StepWizard
          steps={steps}
          onComplete={handleComplete}
          servers={servers}
        />
      </DialogContent>
    </Dialog>
  );
}