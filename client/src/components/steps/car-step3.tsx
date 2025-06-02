import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface CarStep3Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const CarStep3: React.FC<CarStep3Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    imageUrl: data.imageUrl || '',
    discord: data.metadata?.contacts?.discord || '',
    telegram: data.metadata?.contacts?.telegram || '',
    phone: data.metadata?.contacts?.phone || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    let updatedData;
    if (['discord', 'telegram', 'phone'].includes(field)) {
      updatedData = {
        ...data,
        metadata: {
          ...data.metadata,
          contacts: {
            ...data.metadata?.contacts,
            [field]: value
          }
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
    // Валидация: хотя бы один контакт должен быть указан
    const hasContact = formData.discord || formData.telegram || formData.phone;
    onValidationChange(hasContact);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Изображение и контакты</h3>
        <p className="text-slate-400">Добавьте фото автомобиля и укажите контактную информацию</p>
      </div>

      <div className="space-y-6">
        {/* Изображение */}
        <div className="bg-white/5 rounded-lg p-4 space-y-4">
          <h4 className="text-white font-medium mb-4">📸 Изображение</h4>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-slate-300">Ссылка на изображение</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => updateData('imageUrl', e.target.value)}
              placeholder="https://example.com/car-image.jpg"
              className="bg-slate-800 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500">Добавьте ссылку на изображение автомобиля для привлечения покупателей</p>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="bg-white/5 rounded-lg p-4 space-y-4">
          <h4 className="text-white font-medium mb-4">📞 Контактная информация</h4>
          
          <div className="space-y-4">
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
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-400">
              <span className="text-red-400">*</span> Необходимо указать хотя бы один способ связи
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarStep3;