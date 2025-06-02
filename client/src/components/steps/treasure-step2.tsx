import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface TreasureStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TreasureStep2({ data, onDataChange, onValidationChange }: TreasureStep2Props) {
  const [formData, setFormData] = useState({
    discord: data.contacts?.discord || '',
    telegram: data.contacts?.telegram || '',
    phone: data.contacts?.phone || '',
    contact: data.contact || '',
    images: data.images || [],
    additionalInfo: data.additionalInfo || '',
    notes: data.notes || '',
    ...data
  });

  const updateData = (field: string, value: string | any) => {
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
    const hasContact = newData.discord.length > 0 || newData.telegram.length > 0 || newData.phone.length > 0 || newData.contact.length > 0;
    onValidationChange(hasContact);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files];
    updateData('images', newImages);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    updateData('images', newImages);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Изображения и контакты</h3>
        <p className="text-slate-400">Добавьте фото и контактную информацию</p>
      </div>

      {/* Фотографии */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-300">Фотографии сокровища</h4>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-400 mb-4">Добавьте фото с разных ракурсов для лучшей оценки</p>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <label htmlFor="image-upload" className="cursor-pointer">
              Выбрать файлы
            </label>
          </Button>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((image: File, index: number) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Контактная информация */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-300">Контактная информация *</h4>
        <p className="text-sm text-slate-400 mb-4">Укажите хотя бы один способ связи</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-slate-300">Основной контакт</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => updateData('contact', e.target.value)}
              placeholder="Телефон или email"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-300">Дополнительная информация</h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-slate-300">Дополнительная информация</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => updateData('additionalInfo', e.target.value)}
              placeholder="Любая дополнительная информация о сделке, условиях передачи и т.д."
              className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">Дополнительные заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateData('notes', e.target.value)}
              placeholder="Особые условия продажи, история, сертификаты..."
              className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}