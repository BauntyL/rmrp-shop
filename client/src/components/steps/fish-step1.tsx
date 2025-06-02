import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FishStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers?: any[];
}

export default function FishStep1({ data, onDataChange, onValidationChange, servers = [] }: FishStep1Props) {
  const [formData, setFormData] = useState({
    title: data.title || '',
    description: data.description || '',
    price: data.price || '',
    serverId: data.serverId || '',
    fishType: data.fishType || '',
    quantity: data.quantity || 1,
    ...data
  });

  const updateData = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем родительский компонент с правильной структурой данных
    const updatedData = {
      ...data,
      title: newData.title,
      description: newData.description,
      price: typeof newData.price === 'string' ? parseInt(newData.price) : newData.price,
      serverId: typeof newData.serverId === 'string' ? parseInt(newData.serverId) : newData.serverId,
      fishType: newData.fishType,
      quantity: newData.quantity
    };
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    const isValid = 
      formData.title.length > 0 && 
      formData.description.length >= 10 && 
      parseInt(formData.price as string) > 0 && 
      parseInt(formData.serverId as string) > 0;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-4 h-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Основная информация</h3>
        <p className="text-slate-400 text-sm">Тип рыбы, количество, описание, цена и сервер</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">Название *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateData('title', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="Введите название"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="server" className="text-slate-300">Сервер *</Label>
          <Select
            value={formData.serverId?.toString()}
            onValueChange={(value) => updateData('serverId', parseInt(value))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите сервер" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {servers.map((server) => (
                <SelectItem 
                  key={server.id} 
                  value={server.id.toString()}
                  className="text-white hover:bg-slate-700"
                >
                  {server.name}
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
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-slate-300">Цена *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => updateData('price', parseInt(e.target.value) || 0)}
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
          placeholder="Опишите вашу рыбу..."
        />
      </div>
    </div>
  );
}