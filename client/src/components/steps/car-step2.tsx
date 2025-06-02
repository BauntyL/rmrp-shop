import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Image } from 'lucide-react';

interface CarStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const CarStep2: React.FC<CarStep2Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    price: data.price || 0,
    carType: data.carType || '',
    imageUrl: data.imageUrl || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    const updatedData = {
      ...data,
      [field]: value
    };
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    // Валидация обязательных полей
    const isValid = formData.price > 0 && formData.carType.length > 0;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const carTypes = [
    'Стандарт',
    'Купе', 
    'Спорт',
    'Внедорожник',
    'Мотоцикл',
    'Специальное'
  ];

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
            value={formData.contacts.discord}
            onChange={(e) => updateContacts('discord', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="Ваш Discord"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram" className="text-slate-300">Telegram</Label>
          <Input
            id="telegram"
            type="text"
            value={formData.contacts.telegram}
            onChange={(e) => updateContacts('telegram', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-300">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.contacts.phone}
            onChange={(e) => updateContacts('phone', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="+7 (999) 999-99-99"
          />
        </div>
      </div>
    </div>
  );
};

export default CarStep2;