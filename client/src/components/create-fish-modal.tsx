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

  // Функция handleComplete должна быть определена ДО return
  const handleComplete = async (formData: any) => {
    try {
      // Преобразуем данные из формата StepWizard в формат API
      const apiData: CreateFishFormData = {
        description: formData.description || '',
        price: formData.price || 0,
        categoryId: 3,
        serverId: formData.serverId || 0,
        imageUrl: formData.imageUrl || '',
        metadata: {
          fishType: formData.fishType || '',
          quantity: formData.quantity || 1,
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
      };
      
      const response = await apiRequest("POST", "/api/products", productData);
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше рыболовное объявление отправлено на модерацию",
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

  const steps = [
    {
      id: 'basic-info',
      title: 'Основная информация',
      description: 'Укажите тип и количество рыбы',
      component: <FishStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: 'details',
      title: 'Детали и цена',
      description: 'Добавьте описание, фото и цену',
      component: <FishStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: 'contact',
      title: 'Контакты и размещение',
      description: 'Укажите контакты и выберите сервер',
      component: <FishStep3 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20 text-white shadow-2xl shadow-cyan-500/10">
        <StepWizard
          steps={steps}
          category="fish"
          onComplete={handleComplete}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}