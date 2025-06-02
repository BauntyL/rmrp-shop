import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image } from 'lucide-react';
import { z } from 'zod';

const contactsSchema = z.object({
  discord: z.string().optional(),
  telegram: z.string().optional(),
  phone: z.string().optional(),
});

interface TreasureStep2Props {
  data: {
    imageUrl?: string;
    contacts?: z.infer<typeof contactsSchema>;
  };
  onDataChange: (data: {
    imageUrl?: string;
    contacts: z.infer<typeof contactsSchema>;
  }) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TreasureStep2({ data, onDataChange, onValidationChange }: TreasureStep2Props) {
  const [formData, setFormData] = useState({
    imageUrl: data.imageUrl || '',
    discord: data.contacts?.discord || '',
    telegram: data.contacts?.telegram || '',
    phone: data.contacts?.phone || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем данные в правильной структуре
    const updatedData = {
      imageUrl: field === 'imageUrl' ? value : formData.imageUrl,
      contacts: {
        discord: field === 'discord' ? value : formData.discord,
        telegram: field === 'telegram' ? value : formData.telegram,
        phone: field === 'phone' ? value : formData.phone,
      }
    };
    
    onDataChange(updatedData);
    
    // Валидация - требуется хотя бы один способ связи
    const hasContact = newData.discord.length > 0 || newData.telegram.length > 0 || newData.phone.length > 0;
    onValidationChange(hasContact);
  };

  return (
    <div className="space-y-4 h-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Изображение и контакты</h3>
        <p className="text-slate-400">Добавьте изображение и контактную информацию</p>
      </div>

      {/* Изображение */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-purple-300">Изображение сокровища</h4>
        
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
          <p className="text-xs text-slate-400">Вставьте ссылку на изображение вашего сокровища</p>
        </div>
        
        {formData.imageUrl && (
          <div className="border border-slate-600 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Image className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-300">Предварительный просмотр:</span>
            </div>
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="w-full max-w-xs h-32 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Контактная информация */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-purple-300">Контактная информация *</h4>
        <p className="text-sm text-slate-400 mb-3">Укажите хотя бы один способ связи</p>
        
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
    </div>
  );
}