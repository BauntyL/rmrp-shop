import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Image, MessageCircle, Send, Phone } from 'lucide-react';

interface RealEstateStep3Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep3: React.FC<RealEstateStep3Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    imageUrl: data.imageUrl || '',
    discord: data.discord || '',
    telegram: data.telegram || '',
    phone: data.phone || ''
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация: хотя бы один контакт должен быть указан
    const hasContact = newData.discord.trim() !== '' || 
                      newData.telegram.trim() !== '' || 
                      newData.phone.trim() !== '';
    onValidationChange(hasContact);
  };

  return (
    <div className="space-y-4 h-full">
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-slate-300">Ссылка на изображение</Label>
        <div className="relative">
          <Input
            id="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={(e) => updateData('imageUrl', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white pl-10"
            placeholder="https://"
          />
          <Image className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discord" className="text-slate-300">Discord</Label>
          <Input
            id="discord"
            type="text"
            value={formData.discord}
            onChange={(e) => updateData('discord', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="Ваш Discord"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram" className="text-slate-300">Telegram</Label>
          <Input
            id="telegram"
            type="text"
            value={formData.telegram}
            onChange={(e) => updateData('telegram', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-300">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateData('phone', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="+7 (999) 999-99-99"
          />
        </div>
      </div>
    </div>
  );
};