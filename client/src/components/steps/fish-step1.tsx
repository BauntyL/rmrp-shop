import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FishStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FishStep1({ data, onDataChange, onValidationChange }: FishStep1Props) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    species: data.species || '',
    description: data.description || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.name.length > 0 && newData.species.length > 0;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Основная информация о рыбе</h3>
        <p className="text-slate-400">Укажите название и вид рыбы</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Название рыбы *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateData('name', e.target.value)}
            placeholder="Например: Золотая рыбка"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="species" className="text-slate-300">Вид рыбы *</Label>
          <Select value={formData.species} onValueChange={(value) => updateData('species', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите вид" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freshwater">Пресноводная</SelectItem>
              <SelectItem value="saltwater">Морская</SelectItem>
              <SelectItem value="tropical">Тропическая</SelectItem>
              <SelectItem value="coldwater">Холодноводная</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          placeholder="Опишите особенности рыбы, её поведение, условия содержания..."
          className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
        />
      </div>
    </div>
  );
}