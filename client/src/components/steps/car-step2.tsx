import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface CarStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const CarStep2: React.FC<CarStep2Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    price: data.price || 0,
    carType: data.metadata?.carType || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    let updatedData;
    if (field === 'carType') {
      updatedData = {
        ...data,
        metadata: {
          ...data.metadata,
          carType: value
        }
      };
    } else {
      updatedData = {
        ...data,
        [field]: value
      };
    }
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    // Валидация обязательных полей
    const isValid = formData.price > 0 && formData.carType.length > 0;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const carTypes = [
    'Стандарт',
    'Купе',
    'Спорт',
    'Внедорожник',
    'Мотоцикл',
    'Специальное'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Характеристики автомобиля</h3>
        <p className="text-slate-400">Укажите цену и тип автомобиля</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 rounded-lg p-4 space-y-4">
          <h4 className="text-white font-medium mb-4">💰 Цена и тип</h4>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-300">Цена (₽) <span className="text-red-400">*</span></Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => updateData('price', parseInt(e.target.value) || 0)}
              placeholder="1500000"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carType" className="text-slate-300">Тип автомобиля <span className="text-red-400">*</span></Label>
            <Select value={formData.carType} onValueChange={(value) => updateData('carType', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите тип автомобиля" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {carTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-400">
            <span className="text-red-400">*</span> Обязательные поля для заполнения
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarStep2;