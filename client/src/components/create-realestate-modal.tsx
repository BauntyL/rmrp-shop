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
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(2),
  subcategoryId: z.coerce.number().min(1, "Выберите тип недвижимости"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    garageSpaces: z.coerce.number().min(1).max(6),
    warehouses: z.coerce.number().min(1).max(2),
    helipads: z.coerce.number().min(1).max(2),
    income: z.coerce.number().optional(),
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    })
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

  const form = useForm<CreateRealEstateFormData>({
    resolver: zodResolver(createRealEstateSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 2,
      subcategoryId: 0,
      serverId: 0,
      imageUrl: "",
      metadata: {
        garageSpaces: 1,
        warehouses: 1,
        helipads: 1,
        income: 0,
        contacts: {
          discord: "",
          telegram: "",
          phone: "",
        }
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateRealEstateFormData) => {
      const productData = {
        ...data,
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
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
      title: "Основная информация",
      description: "Тип недвижимости, название и описание",
      component: <RealEstateStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step2",
      title: "Детали и характеристики",
      description: "Удобства и особенности недвижимости",
      component: <RealEstateStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step3",
      title: "Контакты, цена и сервер",
      description: "Контактная информация, цена и выбор сервера",
      component: <RealEstateStep3 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/20 text-white shadow-2xl shadow-emerald-500/10">
        <StepWizard
          steps={steps}
          form={form}
          onComplete={handleComplete}
          isLoading={createListingMutation.isPending}
          category="realestate"
          additionalProps={{ servers, subcategories }}
        />
      </DialogContent>
    </Dialog>
  );
}