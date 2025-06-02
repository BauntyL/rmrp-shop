import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface CarStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const CarStep1: React.FC<CarStep1Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    brand: data.brand || '',
    model: data.model || '',
    year: data.year || '',
    bodyType: data.bodyType || '',
    fuelType: data.fuelType || '',
    transmission: data.transmission || '',
    engineVolume: data.engineVolume || '',
    mileage: data.mileage || '',
    condition: data.condition || '',
    description: data.description || ''
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.brand && newData.model && newData.year && 
                   newData.bodyType && newData.fuelType && newData.transmission;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Основная информация</h3>
        <p className="text-white/80 text-sm">Укажите основные характеристики автомобиля</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand" className="text-white">Марка *</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => updateData('brand', e.target.value)}
            placeholder="Toyota, BMW, Mercedes..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="model" className="text-white">Модель *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => updateData('model', e.target.value)}
            placeholder="Camry, X5, E-Class..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="year" className="text-white">Год выпуска *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => updateData('year', e.target.value)}
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear()}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="bodyType" className="text-white">Тип кузова *</Label>
          <Select value={formData.bodyType} onValueChange={(value) => updateData('bodyType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите тип кузова" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Седан</SelectItem>
              <SelectItem value="hatchback">Хэтчбек</SelectItem>
              <SelectItem value="wagon">Универсал</SelectItem>
              <SelectItem value="suv">Внедорожник</SelectItem>
              <SelectItem value="coupe">Купе</SelectItem>
              <SelectItem value="convertible">Кабриолет</SelectItem>
              <SelectItem value="pickup">Пикап</SelectItem>
              <SelectItem value="minivan">Минивэн</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fuelType" className="text-white">Тип топлива *</Label>
          <Select value={formData.fuelType} onValueChange={(value) => updateData('fuelType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
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

        <div>
          <Label htmlFor="transmission" className="text-white">Коробка передач *</Label>
          <Select value={formData.transmission} onValueChange={(value) => updateData('transmission', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите КПП" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Механическая</SelectItem>
              <SelectItem value="automatic">Автоматическая</SelectItem>
              <SelectItem value="cvt">Вариатор</SelectItem>
              <SelectItem value="robot">Робот</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="engineVolume" className="text-white">Объем двигателя (л)</Label>
          <Input
            id="engineVolume"
            type="number"
            step="0.1"
            value={formData.engineVolume}
            onChange={(e) => updateData('engineVolume', e.target.value)}
            placeholder="2.0"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="mileage" className="text-white">Пробег (км)</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => updateData('mileage', e.target.value)}
            placeholder="50000"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="condition" className="text-white">Состояние</Label>
        <Select value={formData.condition} onValueChange={(value) => updateData('condition', value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
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

      <div>
        <Label htmlFor="description" className="text-white">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          placeholder="Дополнительная информация об автомобиле..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
        />
      </div>
    </div>
  );
};