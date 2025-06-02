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
import { ListingStep1, ListingStep2, ListingStep3 } from "@/components/steps";

const createListingSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.coerce.number().min(1, "Выберите категорию"),
  subcategoryId: z.coerce.number().optional(),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    })
  }).optional(),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateListingModal({ open, onOpenChange }: CreateListingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["/api/servers"],
  });

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: 0,
      subcategoryId: undefined,
      serverId: 0,
      imageUrl: "",
      metadata: {
        contacts: {
          discord: "",
          telegram: "",
          phone: "",
        }
      },
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingFormData) => {
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
        images: data.imageUrl ? [data.imageUrl] : [],
      };
      
      const response = await apiRequest("POST", "/api/products", productData);
      await response.json();
      
      toast({
        title: "Объявление создано",
        description: "Ваше объявление отправлено на модерацию",
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
      description: "Категория, название и описание товара",
      component: <ListingStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step2",
      title: "Детали товара",
      description: "Дополнительная информация и изображения",
      component: <ListingStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step3",
      title: "Контакты, цена и сервер",
      description: "Контактная информация, цена и выбор сервера",
      component: <ListingStep3 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-violet-500/20 text-white shadow-2xl shadow-violet-500/10">
        <StepWizard
          steps={steps}
          form={form}
          onComplete={handleComplete}
          isLoading={createListingMutation.isPending}
          category="listing"
          additionalProps={{ servers, categories }}
        />
      </DialogContent>
    </Dialog>
  );
}
