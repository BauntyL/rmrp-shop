import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import StepWizard from "@/components/step-wizard";
import { RealEstateStep1, RealEstateStep2, RealEstateStep3 } from "@/components/steps";

const createRealEstateSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(2),
  subcategoryId: z.coerce.number().min(1, "Тип недвижимости не определен"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    // Дополнительные характеристики
    garageSpaces: z.coerce.number().min(0).optional(),
    warehouses: z.coerce.number().min(0).optional(),
    helipads: z.coerce.number().min(0).optional(),
    income: z.coerce.number().optional(),
    
    // Контакты
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    }),
  }),
});

type CreateRealEstateFormData = z.infer<typeof createRealEstateSchema>;

interface CreateRealEstateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Server {
  id: number;
  name: string;
}

export default function CreateRealEstateModal({ open, onOpenChange }: CreateRealEstateModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<CreateRealEstateFormData>>({
    categoryId: 2,
    subcategoryId: 1,
    metadata: {
      garageSpaces: 0,
      warehouses: 0,
      helipads: 0,
      income: 0,
      contacts: {
        discord: "",
        telegram: "",
        phone: "",
      },
    },
  });

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const handleComplete = async (data: any) => {
    try {
      // Объединяем все данные
      const finalData = {
        ...formData,
        ...data,
        // Убедимся, что все обязательные поля присутствуют
        title: data.title?.trim(),
        description: data.description?.trim(),
        price: Number(data.price),
        serverId: Number(data.serverId),
        // Преобразуем imageUrl в массив images
        images: data.imageUrl ? [data.imageUrl] : [],
        // Обновляем metadata
        metadata: {
          ...formData.metadata,
          ...data.metadata,
          garageSpaces: Number(data.metadata?.garageSpaces) || 0,
          warehouses: Number(data.metadata?.warehouses) || 0,
          helipads: Number(data.metadata?.helipads) || 0,
          income: Number(data.metadata?.income) || 0,
          contacts: {
            ...formData.metadata?.contacts,
            ...data.metadata?.contacts,
          },
        },
      };

      // Валидируем данные
      const validatedData = createRealEstateSchema.parse(finalData);
      console.log('Отправляемые данные:', validatedData);
      
      const response = await apiRequest("POST", "/api/products", validatedData);
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о недвижимости отправлено на модерацию",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error: any) {
      console.error('Ошибка при создании объявления:', error);
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
      description: "Название, сервер и цена",
      component: <RealEstateStep1 
        data={formData} 
        onDataChange={(data) => {
          console.log('Step1 data:', data);
          setFormData((prev) => ({ ...prev, ...data }));
        }} 
        onValidationChange={(isValid) => console.log('Step1 validation:', isValid)} 
        servers={servers} 
      />,
      isValid: true
    },
    {
      id: "step2",
      title: "Дополнительная информация",
      description: "Гаражные места, склады, вертолетные площадки, доход и описание",
      component: <RealEstateStep2 
        data={formData} 
        onDataChange={(data) => {
          console.log('Step2 data:', data);
          setFormData((prev) => ({ ...prev, ...data }));
        }} 
        onValidationChange={(isValid) => console.log('Step2 validation:', isValid)} 
      />,
      isValid: true
    },
    {
      id: "step3",
      title: "Изображение и контакты",
      description: "Ссылка на изображение и контактная информация",
      component: <RealEstateStep3 
        data={formData} 
        onDataChange={(data) => {
          console.log('Step3 data:', data);
          setFormData((prev) => ({ 
            ...prev, 
            imageUrl: data.imageUrl,
            metadata: {
              ...prev.metadata,
              contacts: data.metadata?.contacts
            }
          }));
        }} 
        onValidationChange={(isValid) => console.log('Step3 validation:', isValid)} 
      />,
      isValid: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <StepWizard
          steps={steps}
          onComplete={handleComplete}
          onCancel={() => onOpenChange(false)}
          category="realestate"
          defaultValues={formData}
        />
      </DialogContent>
    </Dialog>
  );
}