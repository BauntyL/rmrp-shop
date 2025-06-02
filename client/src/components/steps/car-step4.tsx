import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MapPin, Phone, MessageCircle } from 'lucide-react';

interface CarStep4Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const CarStep4: React.FC<CarStep4Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    price: data.price || '',
    currency: data.currency || 'RUB',
    negotiable: data.negotiable || false,
    exchange: data.exchange || false,
    exchangeDetails: data.exchangeDetails || '',
    location: data.location || '',
    contactName: data.contactName || '',
    contactPhone: data.contactPhone || '',
    contactEmail: data.contactEmail || '',
    preferredContact: data.preferredContact || 'phone',
    availableTime: data.availableTime || '',
    additionalNotes: data.additionalNotes || ''
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.price && newData.location && 
                   newData.contactName && newData.contactPhone;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Цена и контакты</h3>
        <p className="text-white/80 text-sm">Укажите стоимость и как с вами связаться</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <h4 className="text-white font-medium mb-4">💰 Стоимость</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="price" className="text-white">Цена *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => updateData('price', e.target.value)}
              placeholder="1500000"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          
          <div>
            <Label htmlFor="currency" className="text-white">Валюта</Label>
            <Select value={formData.currency} onValueChange={(value) => updateData('currency', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RUB">₽ Рубли</SelectItem>
                <SelectItem value="USD">$ Доллары</SelectItem>
                <SelectItem value="EUR">€ Евро</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="negotiable"
              checked={formData.negotiable}
              onCheckedChange={(checked) => updateData('negotiable', checked)}
              className="border-white/20"
            />
            <Label htmlFor="negotiable" className="text-white">Торг уместен</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exchange"
              checked={formData.exchange}
              onCheckedChange={(checked) => updateData('exchange', checked)}
              className="border-white/20"
            />
            <Label htmlFor="exchange" className="text-white">Рассматриваю обмен</Label>
          </div>
        </div>

        {formData.exchange && (
          <div>
            <Label htmlFor="exchangeDetails" className="text-white">На что готовы обменять</Label>
            <Textarea
              id="exchangeDetails"
              value={formData.exchangeDetails}
              onChange={(e) => updateData('exchangeDetails', e.target.value)}
              placeholder="Опишите, на какой автомобиль или что готовы обменять..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
            />
          </div>
        )}
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Местоположение
        </h4>
        
        <div>
          <Label htmlFor="location" className="text-white">Город/регион *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateData('location', e.target.value)}
            placeholder="Москва, Санкт-Петербург, Екатеринбург..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          Контактная информация
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName" className="text-white">Имя *</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => updateData('contactName', e.target.value)}
              placeholder="Ваше имя"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="contactPhone" className="text-white">Телефон *</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => updateData('contactPhone', e.target.value)}
              placeholder="+7 (999) 123-45-67"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="contactEmail" className="text-white">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateData('contactEmail', e.target.value)}
              placeholder="your@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="preferredContact" className="text-white">Предпочтительный способ связи</Label>
            <Select value={formData.preferredContact} onValueChange={(value) => updateData('preferredContact', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Телефон</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="availableTime" className="text-white">Удобное время для звонков</Label>
          <Input
            id="availableTime"
            value={formData.availableTime}
            onChange={(e) => updateData('availableTime', e.target.value)}
            placeholder="с 9:00 до 21:00, выходные до 18:00"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="additionalNotes" className="text-white">Дополнительные заметки</Label>
        <Textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => updateData('additionalNotes', e.target.value)}
          placeholder="Любая дополнительная информация для покупателей..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center">
          <MessageCircle className="w-4 h-4 mr-2" />
          Готово к публикации!
        </h4>
        <p className="text-blue-300/80 text-sm">
          Проверьте все данные перед публикацией. После создания объявления вы сможете его отредактировать в личном кабинете.
        </p>
      </div>
    </div>
  );
};