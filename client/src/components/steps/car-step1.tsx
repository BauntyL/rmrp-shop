import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface CarStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers: any[];
}

export const CarStep1: React.FC<CarStep1Props> = ({ data, onDataChange, onValidationChange, servers }) => {
  const [formData, setFormData] = useState({
    title: data.title || '',
    description: data.description || '',
    brand: data.metadata?.brand || '',
    model: data.metadata?.model || '',
    year: data.metadata?.year || new Date().getFullYear(),
    category: data.metadata?.category || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем данные с правильной структурой
    const updatedData = {
      ...data,
      title: newData.title,
      description: newData.description,
      metadata: {
        ...data.metadata,
        brand: newData.brand,
        model: newData.model,
        year: newData.year,
        category: newData.category
      }
    };
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    // Валидация обязательных полей
    const isValid = formData.title.length > 0 && 
                   formData.description.length > 0 &&
                   formData.brand.length > 0 && 
                   formData.model.length > 0 && 
                   formData.year > 1900 && 
                   formData.category.length > 0;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Основная информация</h3>
        <p className="text-slate-400">Укажите основные данные об автомобиле</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">Название объявления *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateData('title', e.target.value)}
            placeholder="Например: BMW X5 2020 года в отличном состоянии"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">Описание *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateData('description', e.target.value)}
            placeholder="Подробное описание автомобиля, его особенности, комплектация..."
            className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-slate-300">Марка *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => updateData('brand', e.target.value)}
              placeholder="BMW, Mercedes, Toyota..."
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-slate-300">Модель *</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => updateData('model', e.target.value)}
              placeholder="X5, E-Class, Camry..."
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-slate-300">Год выпуска *</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) => updateData('year', parseInt(e.target.value) || new Date().getFullYear())}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-300">Категория *</Label>
            <Select value={formData.category} onValueChange={(value) => updateData('category', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedan">Седан</SelectItem>
                <SelectItem value="hatchback">Хэтчбек</SelectItem>
                <SelectItem value="suv">Внедорожник</SelectItem>
                <SelectItem value="coupe">Купе</SelectItem>
                <SelectItem value="wagon">Универсал</SelectItem>
                <SelectItem value="convertible">Кабриолет</SelectItem>
                <SelectItem value="pickup">Пикап</SelectItem>
                <SelectItem value="van">Фургон</SelectItem>
                <SelectItem value="motorcycle">Мотоцикл</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};