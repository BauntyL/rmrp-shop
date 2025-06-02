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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Основная информация</h3>
        <p className="text-slate-400">Укажите название, описание, сервер и контакты</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/5 rounded-lg p-4 space-y-4">
          <h4 className="text-white font-medium mb-4">📝 Основные данные</h4>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Название автомобиля <span className="text-red-400">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateData('title', e.target.value)}
              placeholder="Например: Toyota Camry 2020 года"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Описание <span className="text-red-400">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateData('description', e.target.value)}
              placeholder="Подробное описание автомобиля, его состояния, особенностей..."
              className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverId" className="text-slate-300">Сервер <span className="text-red-400">*</span></Label>
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

        <div className="bg-white/5 rounded-lg p-4 space-y-4">
          <h4 className="text-white font-medium mb-4">📞 Контактная информация</h4>
          <p className="text-sm text-slate-400 mb-4">Укажите хотя бы один способ связи <span className="text-red-400">*</span></p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discord" className="text-slate-300">Discord</Label>
              <Input
                id="discord"
                value={formData.discord}
                onChange={(e) => updateData('discord', e.target.value)}
                placeholder="username#1234"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram" className="text-slate-300">Telegram</Label>
              <Input
                id="telegram"
                value={formData.telegram}
                onChange={(e) => updateData('telegram', e.target.value)}
                placeholder="@username"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateData('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
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

export default CarStep1;