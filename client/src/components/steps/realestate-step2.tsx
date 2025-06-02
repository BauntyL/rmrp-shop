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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Info className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Дополнительная информация</h3>
        </div>
        <p className="text-white/80 text-sm">Укажите дополнительные характеристики недвижимости</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="garageSpaces" className="text-white flex items-center gap-2">
            <Car className="w-4 h-4" />
            Количество гаражных мест
          </Label>
          <Input
            id="garageSpaces"
            type="number"
            value={formData.garageSpaces}
            onChange={(e) => updateData('garageSpaces', e.target.value)}
            placeholder="0"
            min="0"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="warehouses" className="text-white flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            Количество складов
          </Label>
          <Input
            id="warehouses"
            type="number"
            value={formData.warehouses}
            onChange={(e) => updateData('warehouses', e.target.value)}
            placeholder="0"
            min="0"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="helipads" className="text-white flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Количество вертолетных площадок
          </Label>
          <Input
            id="helipads"
            type="number"
            value={formData.helipads}
            onChange={(e) => updateData('helipads', e.target.value)}
            placeholder="0"
            min="0"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      {isBusiness && (
        <div>
          <Label htmlFor="income" className="text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Доход (только для бизнеса)
          </Label>
          <Input
            id="income"
            type="number"
            value={formData.income}
            onChange={(e) => updateData('income', e.target.value)}
            placeholder="50000"
            min="0"
            step="1000"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      )}

      <div>
        <Label htmlFor="description" className="text-white">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          placeholder="Подробное описание недвижимости, особенности, преимущества..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
        />
      </div>
    </div>
  );
};