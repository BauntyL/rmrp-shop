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
    serverId: data.serverId || 0,
    discord: data.contacts?.discord || '',
    telegram: data.contacts?.telegram || '',
    phone: data.contacts?.phone || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    let updatedData;
    if (['discord', 'telegram', 'phone'].includes(field)) {
      updatedData = {
        ...data,
        contacts: {
          ...data.contacts,
          [field]: value
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
    const hasContact = formData.discord.length > 0 || formData.telegram.length > 0 || formData.phone.length > 0;
    const isValid = formData.title.length > 0 && 
                   formData.description.length > 0 &&
                   formData.serverId > 0 &&
                   hasContact;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          placeholder="Опишите ваш автомобиль..."
        />
      </div>
    </div>
  );
};

export default CarStep1;