import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TreasureStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TreasureStep1({ data, onDataChange, onValidationChange }: TreasureStep1Props) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    category: data.category || '',
    description: data.description || '',
    origin: data.origin || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.name.length > 0 && newData.category.length > 0;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Основная информация о сокровище</h3>
        <p className="text-slate-400">Укажите название и категорию сокровища</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Название сокровища *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateData('name', e.target.value)}
            placeholder="Например: Древний амулет"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-slate-300">Категория *</Label>
          <Select value={formData.category} onValueChange={(value) => updateData('category', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jewelry">Украшения</SelectItem>
              <SelectItem value="coins">Монеты</SelectItem>
              <SelectItem value="artifacts">Артефакты</SelectItem>
              <SelectItem value="gems">Драгоценные камни</SelectItem>
              <SelectItem value="antiques">Антиквариат</SelectItem>
              <SelectItem value="collectibles">Коллекционные предметы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="origin" className="text-slate-300">Происхождение</Label>
        <Input
          id="origin"
          value={formData.origin}
          onChange={(e) => updateData('origin', e.target.value)}
          placeholder="Например: Древний Египет, XVIII век"
          className="bg-slate-800 border-slate-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          placeholder="Опишите историю, особенности, материалы..."
          className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
        />
      </div>
    </div>
  );
}