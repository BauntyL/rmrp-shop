import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FishStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FishStep2({ data, onDataChange, onValidationChange }: FishStep2Props) {
  const [formData, setFormData] = useState({
    size: data.size || '',
    age: data.age || '',
    condition: data.condition || '',
    price: data.price || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.size.length > 0 && newData.condition.length > 0 && newData.price.length > 0;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Характеристики и цена</h3>
        <p className="text-slate-400">Укажите размер, возраст и стоимость</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="size" className="text-slate-300">Размер *</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => updateData('size', e.target.value)}
            placeholder="Например: 15 см"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-slate-300">Возраст</Label>
          <Input
            id="age"
            value={formData.age}
            onChange={(e) => updateData('age', e.target.value)}
            placeholder="Например: 2 года"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-slate-300">Состояние *</Label>
          <Select value={formData.condition} onValueChange={(value) => updateData('condition', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите состояние" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Отличное</SelectItem>
              <SelectItem value="good">Хорошее</SelectItem>
              <SelectItem value="fair">Удовлетворительное</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-slate-300">Цена (₽) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => updateData('price', e.target.value)}
            placeholder="0"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
}