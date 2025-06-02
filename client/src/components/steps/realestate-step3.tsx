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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Изображение и контакты</h3>
        </div>
        <p className="text-white/80 text-sm">Добавьте фото и контактную информацию</p>
      </div>

      <div>
        <Label htmlFor="imageUrl" className="text-white flex items-center gap-2">
          <Image className="w-4 h-4" />
          Ссылка на изображение
        </Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => updateData('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Предварительный просмотр" 
              className="w-full max-w-md h-48 object-cover rounded-lg border border-white/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-white font-medium">Контакты <span className="text-red-400">*</span></h4>
        <p className="text-white/70 text-sm">Укажите хотя бы один способ связи</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="discord" className="text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Discord
            </Label>
            <Input
              id="discord"
              type="text"
              value={formData.discord}
              onChange={(e) => updateData('discord', e.target.value)}
              placeholder="username#1234"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="telegram" className="text-white flex items-center gap-2">
              <Send className="w-4 h-4" />
              Telegram
            </Label>
            <Input
              id="telegram"
              type="text"
              value={formData.telegram}
              onChange={(e) => updateData('telegram', e.target.value)}
              placeholder="@username"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Телефон
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateData('phone', e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};