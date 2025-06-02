import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MapPin, Phone, MessageCircle, DollarSign } from 'lucide-react';

interface RealEstateStep4Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep4: React.FC<RealEstateStep4Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    price: data.price || '',
    currency: data.currency || 'RUB',
    priceType: data.priceType || 'total',
    deposit: data.deposit || '',
    commission: data.commission || '',
    utilities: data.utilities || '',
    negotiable: data.negotiable || false,
    mortgage: data.mortgage || false,
    installments: data.installments || false,
    exchange: data.exchange || false,
    exchangeDetails: data.exchangeDetails || '',
    availableFrom: data.availableFrom || '',
    minRentPeriod: data.minRentPeriod || '',
    contactName: data.contactName || '',
    contactPhone: data.contactPhone || '',
    contactEmail: data.contactEmail || '',
    preferredContact: data.preferredContact || 'phone',
    availableTime: data.availableTime || '',
    showingSchedule: data.showingSchedule || '',
    additionalNotes: data.additionalNotes || ''
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.price && newData.contactName && newData.contactPhone;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Цена и контакты</h3>
        <p className="text-white/80 text-sm">Укажите стоимость и условия сделки</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Стоимость
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="price" className="text-white">Цена *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => updateData('price', e.target.value)}
              placeholder="5000000"
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

        <div>
          <Label htmlFor="priceType" className="text-white">Тип цены</Label>
          <Select value={formData.priceType} onValueChange={(value) => updateData('priceType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Общая стоимость</SelectItem>
              <SelectItem value="per_sqm">За м²</SelectItem>
              <SelectItem value="monthly">В месяц</SelectItem>
              <SelectItem value="daily">В сутки</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(formData.priceType === 'monthly' || formData.priceType === 'daily') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deposit" className="text-white">Залог</Label>
              <Input
                id="deposit"
                type="number"
                value={formData.deposit}
                onChange={(e) => updateData('deposit', e.target.value)}
                placeholder="50000"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <div>
              <Label htmlFor="utilities" className="text-white">Коммунальные услуги</Label>
              <Input
                id="utilities"
                type="number"
                value={formData.utilities}
                onChange={(e) => updateData('utilities', e.target.value)}
                placeholder="5000"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="commission" className="text-white">Комиссия агента (%)</Label>
          <Input
            id="commission"
            type="number"
            step="0.1"
            value={formData.commission}
            onChange={(e) => updateData('commission', e.target.value)}
            placeholder="3.0"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
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
              id="mortgage"
              checked={formData.mortgage}
              onCheckedChange={(checked) => updateData('mortgage', checked)}
              className="border-white/20"
            />
            <Label htmlFor="mortgage" className="text-white">Возможна ипотека</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="installments"
              checked={formData.installments}
              onCheckedChange={(checked) => updateData('installments', checked)}
              className="border-white/20"
            />
            <Label htmlFor="installments" className="text-white">Рассрочка</Label>
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
            <Label htmlFor="exchangeDetails" className="text-white">Варианты обмена</Label>
            <Textarea
              id="exchangeDetails"
              value={formData.exchangeDetails}
              onChange={(e) => updateData('exchangeDetails', e.target.value)}
              placeholder="Опишите, на какую недвижимость готовы обменять..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
            />
          </div>
        )}
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        <h4 className="text-white font-medium mb-4">📅 Доступность</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="availableFrom" className="text-white">Доступно с</Label>
            <Input
              id="availableFrom"
              type="date"
              value={formData.availableFrom}
              onChange={(e) => updateData('availableFrom', e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {(formData.priceType === 'monthly' || formData.priceType === 'daily') && (
            <div>
              <Label htmlFor="minRentPeriod" className="text-white">Минимальный срок аренды</Label>
              <Select value={formData.minRentPeriod} onValueChange={(value) => updateData('minRentPeriod', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Выберите срок" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_day">1 день</SelectItem>
                  <SelectItem value="1_week">1 неделя</SelectItem>
                  <SelectItem value="1_month">1 месяц</SelectItem>
                  <SelectItem value="3_months">3 месяца</SelectItem>
                  <SelectItem value="6_months">6 месяцев</SelectItem>
                  <SelectItem value="1_year">1 год</SelectItem>
                  <SelectItem value="long_term">Длительно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="showingSchedule" className="text-white">График показов</Label>
          <Input
            id="showingSchedule"
            value={formData.showingSchedule}
            onChange={(e) => updateData('showingSchedule', e.target.value)}
            placeholder="Будни с 10:00 до 18:00, выходные по договоренности"
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
          placeholder="Любая дополнительная информация для покупателей/арендаторов..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
        />
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <h4 className="text-green-400 font-medium mb-2 flex items-center">
          <MessageCircle className="w-4 h-4 mr-2" />
          Готово к публикации!
        </h4>
        <p className="text-green-300/80 text-sm">
          Проверьте все данные перед публикацией. После создания объявления вы сможете его отредактировать в личном кабинете.
        </p>
      </div>
    </div>
  );
};