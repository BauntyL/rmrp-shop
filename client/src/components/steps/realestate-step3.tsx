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
    contacts: {
      discord: data.metadata?.contacts?.discord || '',
      telegram: data.metadata?.contacts?.telegram || '',
      phone: data.metadata?.contacts?.phone || ''
    }
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData };
    
    if (field === 'imageUrl') {
      newData.imageUrl = value;
    } else {
      newData.contacts = {
        ...newData.contacts,
        [field]: value
      };
    }
    
    setFormData(newData);
    
    // Отправляем данные в правильном формате
    onDataChange({
      imageUrl: newData.imageUrl,
      metadata: {
        contacts: newData.contacts
      }
    });
    
    // Валидация: хотя бы один контакт должен быть указан
    const hasContact = Object.values(newData.contacts).some(contact => contact.trim() !== '');
    onValidationChange(hasContact);
  };

  return (
    <div className="space-y-4 h-full">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Изображение и контакты</h3>
        </div>
        <p className="text-white/80 text-sm">Добавьте изображение и укажите способы связи</p>
      </div>

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
          <Label htmlFor="discord" className="text-slate-300">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Discord</span>
            </div>
          </Label>
          <Input
            id="discord"
            type="text"
            value={formData.contacts.discord}
            onChange={(e) => updateData('discord', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="Ваш Discord"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram" className="text-slate-300">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </div>
          </Label>
          <Input
            id="telegram"
            type="text"
            value={formData.contacts.telegram}
            onChange={(e) => updateData('telegram', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="@username"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone" className="text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Телефон</span>
            </div>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.contacts.phone}
            onChange={(e) => updateData('phone', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="+7 (999) 999-99-99"
          />
        </div>
      </div>
    </div>
  );
};