import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Home, MapPin, Ruler, Bed, Building, Layers, X, Sparkles, Car, Warehouse, Plane, Phone, DollarSign, Image, FileText, MessageCircle, Users } from "lucide-react";
import StepWizard from "@/components/step-wizard";
// Добавить импорты компонентов шагов
import { RealEstateStep1, RealEstateStep2, RealEstateStep3, RealEstateStep4 } from "@/components/steps";

const createRealEstateSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  categoryId: z.literal(2), // Только недвижимость
  subcategoryId: z.coerce.number().min(1, "Выберите тип недвижимости"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
  metadata: z.object({
    garageSpaces: z.coerce.number().min(1).max(6),
    warehouses: z.coerce.number().min(1).max(2),
    helipads: z.coerce.number().min(1).max(2),
    income: z.coerce.number().optional(), // Только для бизнеса
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

// Добавить схему валидации для первого шага
const step1Schema = z.object({
  subcategoryId: z.coerce.number().min(1, "Выберите тип недвижимости"),
  serverId: z.coerce.number().min(1, "Выберите сервер"),
});

const step2Schema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  price: z.coerce.number().min(1, "Цена должна быть больше 0"),
  imageUrl: z.string().url("Введите корректную ссылку на изображение").optional().or(z.literal("")),
});

const step3Schema = z.object({
  serverId: z.coerce.number().min(1, "Выберите сервер"),
  metadata: z.object({
    contacts: z.object({
      discord: z.string().optional(),
      telegram: z.string().optional(),
      phone: z.string().optional(),
    })
  }),
});

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

  const selectedSubcategory = form.watch("subcategoryId");
  const isBusiness = subcategories.find((sub: any) => sub.id === selectedSubcategory)?.name === "realestate_business";

  // Функция handleComplete должна быть определена ДО использования
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
  
  const onSubmit = (data: CreateRealEstateFormData) => {
    handleComplete(data);
  };

  // Функция для получения иконки типа недвижимости
  const getPropertyTypeIcon = (name: string) => {
    switch (name) {
      case "realestate_house": return <Home className="h-4 w-4" />;
      case "realestate_cottage": return <Building className="h-4 w-4" />;
      case "realestate_apartment": return <Layers className="h-4 w-4" />;
      case "realestate_business": return <Sparkles className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  // Удаляем дубликаты подкатегорий
  const uniqueSubcategories = subcategories.filter((subcategory: any, index: number, self: any[]) => 
    index === self.findIndex((s: any) => s.name === subcategory.name)
  );

  const steps = [
    {
      id: "step1",
      title: "Основная информация",
      description: "Тип недвижимости и базовые характеристики",
      component: <RealEstateStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step2",
      title: "Удобства и инфраструктура",
      description: "Дополнительные удобства и особенности",
      component: <RealEstateStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step3",
      title: "Фотографии",
      description: "Загрузите фотографии недвижимости",
      component: <RealEstateStep3 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    },
    {
      id: "step4",
      title: "Цена и контакты",
      description: "Укажите цену и контактную информацию",
      component: <RealEstateStep4 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
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
          additionalProps={{ servers }}
        />
      </DialogContent>
    </Dialog>
  );
}