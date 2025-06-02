import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { DollarSign, Server, Phone, MessageCircle, Users, Upload, Image as ImageIcon } from 'lucide-react';

interface RealEstateStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers?: any[];
}

export const RealEstateStep2: React.FC<RealEstateStep2Props> = ({ 
  data, 
  onDataChange, 
  onValidationChange, 
  servers = []
}) => {
  const [formData, setFormData] = useState({
    price: data.price || 0,
    serverId: data.serverId || 0,
    discord: data.metadata?.contacts?.discord || '',
    telegram: data.metadata?.contacts?.telegram || '',
    phone: data.metadata?.contacts?.phone || '',
    additionalNotes: data.additionalNotes || '',
    images: data.images || [],
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Обновляем данные с правильной структурой
    const updatedData = {
      ...data,
      price: newData.price,
      serverId: newData.serverId,
      additionalNotes: newData.additionalNotes,
      images: newData.images,
      metadata: {
        ...data.metadata,
        contacts: {
          discord: newData.discord,
          telegram: newData.telegram,
          phone: newData.phone,
        }
      }
    };
    
    onDataChange(updatedData);
  };

  useEffect(() => {
    const isValid = formData.price > 0 && 
                   formData.serverId > 0 && 
                   (formData.discord || formData.telegram || formData.phone);
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...formData.images, ...files.slice(0, 5 - formData.images.length)];
      updateData('images', newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    updateData('images', newImages);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DollarSign className="h-6 w-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-emerald-400">Изображения, цена и контакты</h3>
        </div>
        <p className="text-slate-400">Добавьте фотографии, укажите цену и контактную информацию</p>
      </div>

      {/* Изображения */}
      <div className="space-y-4">
        <Label className="text-white font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-purple-400" />
          Фотографии недвижимости
        </Label>
        <p className="text-sm text-slate-400">Добавьте до 5 фотографий (JPG, PNG, WebP)</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {formData.images.map((image: any, index: number) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-slate-700/50 rounded-lg border-2 border-slate-600/50 overflow-hidden">
                <img 
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          
          {formData.images.length < 5 && (
            <label className="aspect-square bg-slate-700/30 border-2 border-dashed border-slate-600/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-400">Добавить фото</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Цена */}
      <div className="space-y-2">
        <Label className="text-white font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-yellow-400" />
          Цена *
        </Label>
        <div className="relative">
          <Input 
            type="number" 
            placeholder="0" 
            value={formData.price}
            onChange={(e) => updateData('price', parseInt(e.target.value) || 0)}
            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-yellow-500/50 transition-colors pr-12"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-medium">₽</span>
        </div>
      </div>

      {/* Выбор сервера */}
      <div className="space-y-2">
        <Label className="text-white font-medium flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-400" />
          Сервер *
        </Label>
        <Select 
          onValueChange={(value) => updateData('serverId', parseInt(value))} 
          value={formData.serverId?.toString()}
        >
          <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:border-blue-500/50 transition-colors">
            <SelectValue placeholder="Выберите сервер" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {servers.map((server: any) => (
              <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-slate-700">
                {server.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Контактная информация */}
      <div className="space-y-4">
        <Label className="text-white font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          Контактная информация *
        </Label>
        <p className="text-sm text-slate-400">Укажите хотя бы один способ связи</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white text-sm flex items-center gap-2">
              <MessageCircle className="h-3 w-3 text-indigo-400" />
              Discord
            </Label>
            <Input 
              placeholder="username#1234" 
              value={formData.discord}
              onChange={(e) => updateData('discord', e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-indigo-500/50 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white text-sm flex items-center gap-2">
              <MessageCircle className="h-3 w-3 text-blue-400" />
              Telegram
            </Label>
            <Input 
              placeholder="@username" 
              value={formData.telegram}
              onChange={(e) => updateData('telegram', e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white text-sm flex items-center gap-2">
              <Phone className="h-3 w-3 text-green-400" />
              Телефон
            </Label>
            <Input 
              placeholder="+7 (999) 123-45-67" 
              value={formData.phone}
              onChange={(e) => updateData('phone', e.target.value)}
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Дополнительные заметки */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Дополнительные заметки</Label>
        <Textarea 
          placeholder="Любая дополнительная информация для покупателей/арендаторов" 
          rows={3}
          value={formData.additionalNotes}
          onChange={(e) => updateData('additionalNotes', e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors resize-none"
        />
      </div>
    </div>
  );
};