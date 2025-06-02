import React from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateFishFormData) => {
      const productData = {
        ...data,
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление создано",
        description: "Ваше рыболовное объявление отправлено на модерацию",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
    },
  });

  const handleComplete = (formData: any) => {
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

    createListingMutation.mutate(apiData);
  };

  const steps = [
    {
      id: 'basic-info',
      title: 'Основная информация',
      description: 'Укажите тип и количество рыбы',
      component: FishStep1,
      validation: (data: any) => {
        const errors: string[] = [];
        if (!data.fishType?.trim()) errors.push('Укажите тип рыбы');
        if (!data.quantity || data.quantity < 1) errors.push('Укажите количество');
        return errors;
      }
    },
    {
      id: 'details',
      title: 'Детали и цена',
      description: 'Добавьте описание, фото и цену',
      component: FishStep2,
      validation: (data: any) => {
        const errors: string[] = [];
        if (!data.description?.trim() || data.description.length < 10) {
          errors.push('Описание должно содержать минимум 10 символов');
        }
        if (!data.price || data.price < 1) errors.push('Укажите цену');
        return errors;
      }
    },
    {
      id: 'contact',
      title: 'Контакты и размещение',
      description: 'Укажите контакты и выберите сервер',
      component: FishStep3,
      validation: (data: any) => {
        const errors: string[] = [];
        if (!data.serverId) errors.push('Выберите сервер');
        const hasContact = data.discord?.trim() || data.telegram?.trim() || data.phone?.trim();
        if (!hasContact) errors.push('Укажите хотя бы один способ связи');
        return errors;
      }
    }
  ];

  return (
    <StepWizard
      open={open}
      onOpenChange={onOpenChange}
      steps={steps}
      category="fish"
      title="Продажа рыбы"
      description="Создайте объявление о продаже рыбы"
      onComplete={handleComplete}
      isLoading={createListingMutation.isPending}
      additionalProps={{ servers }}
    />
  );
}