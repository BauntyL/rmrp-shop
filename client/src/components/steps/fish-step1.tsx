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
    fishType: data.fishType || '',
    quantity: data.quantity || 1,
    description: data.description || '',
    price: data.price || '',
    serverId: data.serverId || '',
    ...data
  });

  const updateData = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  useEffect(() => {
    const isValid = formData.fishType.length > 0 && 
                   formData.quantity > 0 && 
                   formData.description.length >= 10 && 
                   formData.price > 0 && 
                   formData.serverId;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Основная информация</h3>
        <p className="text-slate-400 text-sm">Тип рыбы, количество, описание, цена и сервер</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fishType" className="text-slate-300">Тип рыбы *</Label>
          <Input
            id="fishType"
            value={formData.fishType}
            onChange={(e) => updateData('fishType', e.target.value)}
            placeholder="Например: Лосось, Окунь, Щука"
            className="bg-slate-800 border-slate-600 text-white"
          />
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
            step="0.01"
            value={formData.price}
            onChange={(e) => updateData('price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serverId" className="text-slate-300">Сервер *</Label>
          <Select value={formData.serverId.toString()} onValueChange={(value) => updateData('serverId', parseInt(value))}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите сервер" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-slate-700">
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Описание *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          placeholder="Опишите вашу рыбу (минимум 10 символов)"
          className="bg-slate-800 border-slate-600 text-white min-h-[80px] resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}