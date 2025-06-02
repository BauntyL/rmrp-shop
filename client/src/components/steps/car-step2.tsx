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
    engineType: data.metadata?.engineType || '',
    engineVolume: data.metadata?.engineVolume || 0,
    horsepower: data.metadata?.horsepower || 0,
    transmission: data.metadata?.transmission || '',
    driveType: data.metadata?.driveType || '',
    fuelType: data.metadata?.fuelType || '',
    mileage: data.metadata?.mileage || 0,
    condition: data.metadata?.condition || '',
    color: data.metadata?.color || '',
    imageUrl: data.imageUrl || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем данные с правильной структурой
    const updatedData = {
      ...data,
      imageUrl: newData.imageUrl,
      metadata: {
        ...data.metadata,
        engineType: newData.engineType,
        engineVolume: newData.engineVolume,
        horsepower: newData.horsepower,
        transmission: newData.transmission,
        driveType: newData.driveType,
        fuelType: newData.fuelType,
        mileage: newData.mileage,
        condition: newData.condition,
        color: newData.color
      }
    };
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    // Валидация обязательных полей
    const isValid = formData.engineType.length > 0 && 
                   formData.engineVolume > 0 &&
                   formData.horsepower > 0 && 
                   formData.transmission.length > 0 && 
                   formData.driveType.length > 0 && 
                   formData.fuelType.length > 0 &&
                   formData.condition.length > 0 &&
                   formData.color.length > 0;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Детали автомобиля</h3>
        <p className="text-slate-400">Укажите технические характеристики и состояние</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-slate-300">Ссылка на изображение</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => updateData('imageUrl', e.target.value)}
            placeholder="https://example.com/car-image.jpg"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="engineType" className="text-slate-300">Тип двигателя *</Label>
            <Input
              id="engineType"
              value={formData.engineType}
              onChange={(e) => updateData('engineType', e.target.value)}
              placeholder="V6, V8, Inline-4, Turbo..."
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineVolume" className="text-slate-300">Объем двигателя (л) *</Label>
            <Input
              id="engineVolume"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.engineVolume}
              onChange={(e) => updateData('engineVolume', parseFloat(e.target.value) || 0)}
              placeholder="2.0"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horsepower" className="text-slate-300">Мощность (л.с.) *</Label>
            <Input
              id="horsepower"
              type="number"
              min="1"
              value={formData.horsepower}
              onChange={(e) => updateData('horsepower', parseInt(e.target.value) || 0)}
              placeholder="150"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transmission" className="text-slate-300">Коробка передач *</Label>
            <Select value={formData.transmission} onValueChange={(value) => updateData('transmission', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите тип КПП" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Механическая</SelectItem>
                <SelectItem value="automatic">Автоматическая</SelectItem>
                <SelectItem value="cvt">Вариатор (CVT)</SelectItem>
                <SelectItem value="robot">Робот</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driveType" className="text-slate-300">Тип привода *</Label>
            <Select value={formData.driveType} onValueChange={(value) => updateData('driveType', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите тип привода" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Передний</SelectItem>
                <SelectItem value="rear">Задний</SelectItem>
                <SelectItem value="all">Полный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelType" className="text-slate-300">Тип топлива *</Label>
            <Select value={formData.fuelType} onValueChange={(value) => updateData('fuelType', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите тип топлива" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Бензин</SelectItem>
                <SelectItem value="diesel">Дизель</SelectItem>
                <SelectItem value="hybrid">Гибрид</SelectItem>
                <SelectItem value="electric">Электро</SelectItem>
                <SelectItem value="gas">Газ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage" className="text-slate-300">Пробег (км) *</Label>
            <Input
              id="mileage"
              type="number"
              min="0"
              value={formData.mileage}
              onChange={(e) => updateData('mileage', parseInt(e.target.value) || 0)}
              placeholder="50000"
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
                <SelectItem value="new">Новый</SelectItem>
                <SelectItem value="excellent">Отличное</SelectItem>
                <SelectItem value="good">Хорошее</SelectItem>
                <SelectItem value="fair">Удовлетворительное</SelectItem>
                <SelectItem value="poor">Требует ремонта</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color" className="text-slate-300">Цвет *</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => updateData('color', e.target.value)}
            placeholder="Черный, белый, серебристый..."
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
};