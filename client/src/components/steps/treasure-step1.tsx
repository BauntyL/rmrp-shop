import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TreasureStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TreasureStep1({ data, onDataChange, onValidationChange }: TreasureStep1Props) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    description: data.description || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.name.length > 0 && newData.description.length >= 10;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Основная информация о кладе</h3>
        <p className="text-slate-400">Укажите название и описание клада</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Название клада *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateData('name', e.target.value)}
            placeholder="Например: Древний амулет силы"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">Описание клада *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateData('description', e.target.value)}
            placeholder="Подробно опишите клад, его историю, особенности и значимость..."
            className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
          />
          <p className="text-xs text-slate-400">
            Минимум 10 символов ({formData.description.length}/10)
          </p>
        </div>
      </div>
    </div>
  );
}