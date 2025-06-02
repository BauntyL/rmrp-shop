import React from "react";
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
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(2),
  subcategoryId: z.coerce.number().min(1, "Выберите тип недвижимости"),
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

export default function CreateRealEstateModal({ open, onOpenChange }: CreateRealEstateModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/categories", { parentId: 2 }],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const handleComplete = async (data: any) => {
    try {
      const productData = {
        ...data,
        categoryId: 2,
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      
      const response = await apiRequest("POST", "/api/products", productData);
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о недвижимости отправлено на модерацию",
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
      id: "step1",
      title: "Тип и характеристики",
      description: "Тип недвижимости, сервер, название и цена",
      component: <RealEstateStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} servers={servers} subcategories={subcategories} />,
      isValid: true
    },
    {
      id: "step2",
      title: "Дополнительная информация",
      description: "Гаражные места, склады, вертолетные площадки, доход и описание",
      component: <RealEstateStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step3",
      title: "Изображение и контакты",
      description: "Ссылка на изображение и контактная информация",
      component: <RealEstateStep3 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
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
        />
      </DialogContent>
    </Dialog>
  );
}