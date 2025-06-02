import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FishStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FishStep2({ data, onDataChange, onValidationChange }: FishStep2Props) {
  const [formData, setFormData] = useState({
    imageUrl: data.imageUrl || '',
    discord: data.discord || '',
    telegram: data.telegram || '',
    phone: data.phone || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  useEffect(() => {
    // Хотя бы один контакт должен быть заполнен
    const hasContact = formData.discord || formData.telegram || formData.phone;
    onValidationChange(hasContact);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Изображение и контакты</h3>
        <p className="text-slate-400">Добавьте изображение и контактную информацию</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-slate-300">Ссылка на изображение</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => updateData('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="border-t border-slate-600 pt-4">
          <h4 className="text-md font-medium text-slate-300 mb-4">Контакты *</h4>
          <p className="text-sm text-slate-400 mb-4">Укажите хотя бы один способ связи</p>
          
          <div className="grid grid-cols-1 gap-4">
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
      </div>
    </div>
  );
}