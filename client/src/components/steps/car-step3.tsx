import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface CarStep3Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers: any[];
}

export const CarStep3: React.FC<CarStep3Props> = ({ data, onDataChange, onValidationChange, servers }) => {
  const [formData, setFormData] = useState({
    price: data.price || 0,
    serverId: data.serverId || 0,
    discord: data.metadata?.contacts?.discord || '',
    telegram: data.metadata?.contacts?.telegram || '',
    phone: data.metadata?.contacts?.phone || '',
    additionalInfo: data.metadata?.additionalInfo || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем данные с правильной структурой
    const updatedData = {
      ...data,
      price: newData.price,
      serverId: newData.serverId,
      metadata: {
        ...data.metadata,
        additionalInfo: newData.additionalInfo,
        contacts: {
          discord: newData.discord,
          telegram: newData.telegram,
          phone: newData.phone
        }
      }
    };
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    // Валидация: цена > 0, сервер выбран, хотя бы один контакт
    const hasContact = formData.discord || formData.telegram || formData.phone;
    const isValid = formData.price > 0 && formData.serverId > 0 && hasContact;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Контакты и цена</h3>
        <p className="text-slate-400">Укажите цену, контакты и выберите сервер</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-300">Цена (₽) *</Label>
            <Input
              id="price"
              type="number"
              min="1"
              value={formData.price}
              onChange={(e) => updateData('price', parseInt(e.target.value) || 0)}
              placeholder="1500000"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverId" className="text-slate-300">Сервер *</Label>
            <Select value={formData.serverId.toString()} onValueChange={(value) => updateData('serverId', parseInt(value))}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите сервер" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server: any) => (
                  <SelectItem key={server.id} value={server.id.toString()}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-slate-300">Контактная информация</h4>
          
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
              placeholder="@username или +7XXXXXXXXXX"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-300">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateData('phone', e.target.value)}
              placeholder="+7 (XXX) XXX-XX-XX"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-slate-300">Дополнительная информация</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => updateData('additionalInfo', e.target.value)}
              placeholder="Предпочтительное время для связи, дополнительные контакты, особые условия продажи..."
              className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
            />
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-400">
            <span className="text-red-400">*</span> Необходимо указать хотя бы один способ связи
          </p>
        </div>
      </div>
    </div>
  );
};