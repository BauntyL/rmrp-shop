import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Info, Car, Warehouse, Plane, TrendingUp } from 'lucide-react';

interface RealEstateStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep2: React.FC<RealEstateStep2Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    garageSpaces: data.metadata?.garageSpaces || '',
    warehouses: data.metadata?.warehouses || '',
    helipads: data.metadata?.helipads || '',
    income: data.metadata?.income || '',
    description: data.description || ''
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Преобразуем данные в правильный формат для API
    const apiData = {
      description: newData.description,
      metadata: {
        garageSpaces: Number(newData.garageSpaces) || 0,
        warehouses: Number(newData.warehouses) || 0,
        helipads: Number(newData.helipads) || 0,
        income: Number(newData.income) || 0
      }
    };
    
    onDataChange(apiData);
    
    // Валидация: описание обязательно
    const isValid = newData.description.trim().length > 0;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-4 h-full">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Дополнительная информация</h3>
        </div>
        <p className="text-white/80 text-sm">Укажите характеристики недвижимости</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="garageSpaces" className="text-slate-300">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span>Парковочные места</span>
            </div>
          </Label>
          <Input
            id="garageSpaces"
            type="number"
            min="0"
            value={formData.garageSpaces}
            onChange={(e) => updateData('garageSpaces', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warehouses" className="text-slate-300">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4" />
              <span>Складские помещения</span>
            </div>
          </Label>
          <Input
            id="warehouses"
            type="number"
            min="0"
            value={formData.warehouses}
            onChange={(e) => updateData('warehouses', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="helipads" className="text-slate-300">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              <span>Вертолетные площадки</span>
            </div>
          </Label>
          <Input
            id="helipads"
            type="number"
            min="0"
            value={formData.helipads}
            onChange={(e) => updateData('helipads', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="income" className="text-slate-300">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Ежемесячный доход</span>
            </div>
          </Label>
          <Input
            id="income"
            type="number"
            min="0"
            value={formData.income}
            onChange={(e) => updateData('income', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Описание *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          className="bg-slate-800 border-slate-600 text-white h-24"
          placeholder="Опишите вашу недвижимость подробнее..."
        />
      </div>
    </div>
  );
};