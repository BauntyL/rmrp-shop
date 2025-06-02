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
    garageSpaces: data.garageSpaces || '',
    warehouses: data.warehouses || '',
    helipads: data.helipads || '',
    income: data.income || '',
    description: data.description || ''
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Для этого шага валидация не обязательна, все поля опциональны
    onValidationChange(true);
  };

  // Проверяем, выбран ли тип "Бизнес" для показа поля дохода
  const isBusiness = data.subcategoryId === 3;

  return (
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="parkingSpaces" className="text-slate-300">Парковочные места</Label>
          <Input
            id="parkingSpaces"
            type="number"
            min="0"
            value={formData.parkingSpaces}
            onChange={(e) => updateData('parkingSpaces', parseInt(e.target.value) || 0)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storageRooms" className="text-slate-300">Складские помещения</Label>
          <Input
            id="storageRooms"
            type="number"
            min="0"
            value={formData.storageRooms}
            onChange={(e) => updateData('storageRooms', parseInt(e.target.value) || 0)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="helipadCount" className="text-slate-300">Вертолетные площадки</Label>
          <Input
            id="helipadCount"
            type="number"
            min="0"
            value={formData.helipadCount}
            onChange={(e) => updateData('helipadCount', parseInt(e.target.value) || 0)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyIncome" className="text-slate-300">Ежемесячный доход</Label>
          <Input
            id="monthlyIncome"
            type="number"
            min="0"
            value={formData.monthlyIncome}
            onChange={(e) => updateData('monthlyIncome', parseInt(e.target.value) || 0)}
            className="bg-slate-800 border-slate-600 text-white"
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
          placeholder="Опишите вашу недвижимость..."
        />
      </div>
    </div>
  );
};