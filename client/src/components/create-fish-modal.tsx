import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { StepWizard } from '@/components/step-wizard';
import FishStep1 from '@/components/steps/fish-step1';
import FishStep2 from '@/components/steps/fish-step2';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createFishSchema } from '@/shared/schema';

interface CreateFishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servers: any[];
}

export default function CreateFishModal({ open, onOpenChange, servers }: CreateFishModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFishMutation = useMutation({
    mutationFn: async (data: any) => {
      const validatedData = createFishSchema.parse(data);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) throw new Error('Failed to create fish listing');
      return response.json();
    },
  });

  const handleComplete = async (data: any) => {
    try {
      await createFishMutation.mutateAsync(data);
      toast({
        title: "Объявление создано",
        description: "Ваше объявление о рыбе отправлено на модерацию",
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
      description: "Тип рыбы, количество, описание, цена и сервер",
      component: <FishStep1 data={{}} onDataChange={() => {}} onValidationChange={() => {}} servers={servers} />,
      isValid: true
    },
    {
      id: "step2", 
      title: "Изображение и контакты",
      description: "Ссылка на изображение и контактная информация",
      component: <FishStep2 data={{}} onDataChange={() => {}} onValidationChange={() => {}} />,
      isValid: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-slate-900 border-slate-700">
        <StepWizard
          steps={steps}
          onComplete={handleComplete}
          onCancel={() => onOpenChange(false)}
          category="fish"
        />
      </DialogContent>
    </Dialog>
  );
}