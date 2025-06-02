import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image } from 'lucide-react';

interface TreasureStep2Props {
  data: any;
  onDataChange: (data: any) => void;
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
    
    // Валидация - требуется хотя бы один способ связи
    const hasContact = newData.discord.length > 0 || newData.telegram.length > 0 || newData.phone.length > 0;
    onValidationChange(hasContact);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Изображение и контакты</h3>
        <p className="text-slate-400">Добавьте изображение и контактную информацию</p>
      </div>

      {/* Изображение */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-purple-300">Изображение сокровища</h4>
        
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
        
        <div className="space-y-3">
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
  );
}