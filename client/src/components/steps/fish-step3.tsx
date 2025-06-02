import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FishStep3Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FishStep3({ data, onDataChange, onValidationChange }: FishStep3Props) {
  const [formData, setFormData] = useState({
    discord: data.discord || '',
    telegram: data.telegram || '',
    phone: data.phone || '',
    additionalInfo: data.additionalInfo || '',
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
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Контактная информация</h3>
        <p className="text-slate-400">Укажите как с вами можно связаться</p>
      </div>

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

        <div className="space-y-2">
          <Label htmlFor="additionalInfo" className="text-slate-300">Дополнительная информация</Label>
          <Textarea
            id="additionalInfo"
            value={formData.additionalInfo}
            onChange={(e) => updateData('additionalInfo', e.target.value)}
            placeholder="Предпочтительное время для связи, дополнительные контакты..."
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
  );
}