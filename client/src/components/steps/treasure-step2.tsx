import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TreasureStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TreasureStep2({ data, onDataChange, onValidationChange }: TreasureStep2Props) {
  const [formData, setFormData] = useState({
    treasureType: data.metadata?.treasureType || '',
    quantity: data.metadata?.quantity || 1,
    rarity: data.metadata?.rarity || '',
    condition: data.metadata?.condition || '',
    imageUrl: data.metadata?.imageUrl || '',
    ...data
  });

  const updateData = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем данные в правильной структуре
    const updatedData = {
      ...data,
      metadata: {
        ...data.metadata,
        [field]: value
      }
    };
    onDataChange(updatedData);
    
    // Валидация
    const isValid = newData.treasureType.length > 0 && 
                   newData.quantity > 0 && 
                   newData.rarity.length > 0 && 
                   newData.condition.length > 0;
    onValidationChange(isValid);
  };

  const treasureTypes = [
    { value: 'weapon', label: 'Оружие' },
    { value: 'armor', label: 'Броня' },
    { value: 'jewelry', label: 'Украшения' },
    { value: 'artifact', label: 'Артефакт' },
    { value: 'scroll', label: 'Свиток' },
    { value: 'potion', label: 'Зелье' },
    { value: 'gem', label: 'Драгоценный камень' },
    { value: 'relic', label: 'Реликвия' },
    { value: 'other', label: 'Другое' }
  ];

  const rarityLevels = [
    { value: 'common', label: 'Обычный' },
    { value: 'uncommon', label: 'Необычный' },
    { value: 'rare', label: 'Редкий' },
    { value: 'epic', label: 'Эпический' },
    { value: 'legendary', label: 'Легендарный' },
    { value: 'mythic', label: 'Мифический' }
  ];

  const conditionLevels = [
    { value: 'perfect', label: 'Идеальное' },
    { value: 'excellent', label: 'Отличное' },
    { value: 'good', label: 'Хорошее' },
    { value: 'fair', label: 'Удовлетворительное' },
    { value: 'poor', label: 'Плохое' },
    { value: 'damaged', label: 'Поврежденное' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Детали клада</h3>
        <p className="text-slate-400">Укажите тип, количество, редкость и состояние</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="treasureType" className="text-slate-300">Тип клада *</Label>
          <Select value={formData.treasureType} onValueChange={(value) => updateData('treasureType', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите тип клада" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {treasureTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-slate-300">Количество *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => updateData('quantity', parseInt(e.target.value) || 1)}
            placeholder="1"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rarity" className="text-slate-300">Редкость *</Label>
          <Select value={formData.rarity} onValueChange={(value) => updateData('rarity', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите редкость" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {rarityLevels.map((rarity) => (
                <SelectItem key={rarity.value} value={rarity.value} className="text-white hover:bg-slate-700">
                  {rarity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition" className="text-slate-300">Состояние *</Label>
          <Select value={formData.condition} onValueChange={(value) => updateData('condition', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите состояние" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {conditionLevels.map((condition) => (
                <SelectItem key={condition.value} value={condition.value} className="text-white hover:bg-slate-700">
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-slate-300">URL изображения (необязательно)</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => updateData('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-slate-800 border-slate-600 text-white"
        />
        <p className="text-xs text-slate-400">
          Добавьте ссылку на изображение клада для привлечения покупателей
        </p>
      </div>
    </div>
  );
}