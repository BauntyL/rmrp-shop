import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TreasureStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TreasureStep2({ data, onDataChange, onValidationChange }: TreasureStep2Props) {
  const [formData, setFormData] = useState({
    material: data.material || '',
    condition: data.condition || '',
    authenticity: data.authenticity || '',
    price: data.price || '',
    appraisal: data.appraisal || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.material.length > 0 && newData.condition.length > 0 && newData.price.length > 0;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Характеристики и оценка</h3>
        <p className="text-slate-400">Укажите материал, состояние и стоимость</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="material" className="text-slate-300">Материал *</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => updateData('material', e.target.value)}
            placeholder="Например: Золото 585 пробы"
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
              <SelectItem value="mint">Идеальное</SelectItem>
              <SelectItem value="excellent">Отличное</SelectItem>
              <SelectItem value="good">Хорошее</SelectItem>
              <SelectItem value="fair">Удовлетворительное</SelectItem>
              <SelectItem value="poor">Требует реставрации</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authenticity" className="text-slate-300">Подлинность</Label>
          <Select value={formData.authenticity} onValueChange={(value) => updateData('authenticity', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="certified">Сертифицирована</SelectItem>
              <SelectItem value="expert">Экспертная оценка</SelectItem>
              <SelectItem value="family">Семейная реликвия</SelectItem>
              <SelectItem value="unknown">Неизвестно</SelectItem>
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

      <div className="space-y-2">
        <Label htmlFor="appraisal" className="text-slate-300">Оценочная стоимость или история</Label>
        <Textarea
          id="appraisal"
          value={formData.appraisal}
          onChange={(e) => updateData('appraisal', e.target.value)}
          placeholder="Укажите оценочную стоимость, историю приобретения или другие важные детали..."
          className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
        />
      </div>
    </div>
  );
}