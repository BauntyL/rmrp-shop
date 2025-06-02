import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface RealEstateStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep2: React.FC<RealEstateStep2Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    amenities: data.amenities || [],
    infrastructure: data.infrastructure || [],
    parking: data.parking || '',
    balcony: data.balcony || '',
    view: data.view || '',
    heating: data.heating || '',
    utilities: data.utilities || [],
    security: data.security || [],
    accessibility: data.accessibility || [],
    petPolicy: data.petPolicy || '',
    smokingPolicy: data.smokingPolicy || '',
    additionalFeatures: data.additionalFeatures || ''
  });

  const amenitiesOptions = [
    'Кондиционер', 'Отопление', 'Интернет', 'Кабельное ТВ', 'Стиральная машина',
    'Посудомоечная машина', 'Холодильник', 'Плита', 'Духовка', 'Микроволновка',
    'Мебель', 'Встроенные шкафы', 'Гардеробная', 'Кладовая', 'Лоджия/Балкон'
  ];

  const infrastructureOptions = [
    'Школа', 'Детский сад', 'Поликлиника', 'Больница', 'Аптека',
    'Супермаркет', 'Торговый центр', 'Ресторан/Кафе', 'Банк', 'Почта',
    'Спортзал', 'Бассейн', 'Парк', 'Метро', 'Автобусная остановка',
    'Железнодорожная станция', 'Аэропорт'
  ];

  const utilitiesOptions = [
    'Электричество', 'Газ', 'Водоснабжение', 'Канализация', 'Отопление',
    'Горячая вода', 'Интернет', 'Телефон', 'Кабельное ТВ'
  ];

  const securityOptions = [
    'Консьерж', 'Охрана', 'Видеонаблюдение', 'Домофон', 'Кодовый замок',
    'Сигнализация', 'Закрытая территория', 'КПП'
  ];

  const accessibilityOptions = [
    'Лифт', 'Пандус', 'Широкие дверные проемы', 'Поручни',
    'Доступ для колясок', 'Низкие пороги'
  ];

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация (все поля опциональные на этом шаге)
    onValidationChange(true);
  };

  const toggleArrayItem = (array: string[], item: string, field: string) => {
    const newArray = array.includes(item)
      ? array.filter((i: string) => i !== item)
      : [...array, item];
    updateData(field, newArray);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Удобства и инфраструктура</h3>
        <p className="text-white/80 text-sm">Укажите доступные удобства и близлежащую инфраструктуру</p>
      </div>

      <div>
        <Label className="text-white mb-3 block">Удобства в квартире/доме</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {amenitiesOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${item}`}
                checked={formData.amenities.includes(item)}
                onCheckedChange={() => toggleArrayItem(formData.amenities, item, 'amenities')}
                className="border-white/20"
              />
              <Label htmlFor={`amenity-${item}`} className="text-white text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Инфраструктура рядом</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {infrastructureOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`infra-${item}`}
                checked={formData.infrastructure.includes(item)}
                onCheckedChange={() => toggleArrayItem(formData.infrastructure, item, 'infrastructure')}
                className="border-white/20"
              />
              <Label htmlFor={`infra-${item}`} className="text-white text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parking" className="text-white">Парковка</Label>
          <Select value={formData.parking} onValueChange={(value) => updateData('parking', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите тип парковки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              <SelectItem value="street">Уличная</SelectItem>
              <SelectItem value="yard">Во дворе</SelectItem>
              <SelectItem value="underground">Подземная</SelectItem>
              <SelectItem value="garage">Гараж</SelectItem>
              <SelectItem value="covered">Крытая</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="balcony" className="text-white">Балкон/Лоджия</Label>
          <Select value={formData.balcony} onValueChange={(value) => updateData('balcony', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              <SelectItem value="balcony">Балкон</SelectItem>
              <SelectItem value="loggia">Лоджия</SelectItem>
              <SelectItem value="terrace">Терраса</SelectItem>
              <SelectItem value="multiple">Несколько</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="view" className="text-white">Вид из окон</Label>
          <Select value={formData.view} onValueChange={(value) => updateData('view', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите вид" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yard">Во двор</SelectItem>
              <SelectItem value="street">На улицу</SelectItem>
              <SelectItem value="park">На парк</SelectItem>
              <SelectItem value="river">На реку</SelectItem>
              <SelectItem value="city">На город</SelectItem>
              <SelectItem value="forest">На лес</SelectItem>
              <SelectItem value="sea">На море</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="heating" className="text-white">Отопление</Label>
          <Select value={formData.heating} onValueChange={(value) => updateData('heating', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Тип отопления" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central">Центральное</SelectItem>
              <SelectItem value="individual">Индивидуальное</SelectItem>
              <SelectItem value="gas">Газовое</SelectItem>
              <SelectItem value="electric">Электрическое</SelectItem>
              <SelectItem value="fireplace">Камин</SelectItem>
              <SelectItem value="none">Нет</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Коммунальные услуги</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {utilitiesOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`utility-${item}`}
                checked={formData.utilities.includes(item)}
                onCheckedChange={() => toggleArrayItem(formData.utilities, item, 'utilities')}
                className="border-white/20"
              />
              <Label htmlFor={`utility-${item}`} className="text-white text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Безопасность</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {securityOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`security-${item}`}
                checked={formData.security.includes(item)}
                onCheckedChange={() => toggleArrayItem(formData.security, item, 'security')}
                className="border-white/20"
              />
              <Label htmlFor={`security-${item}`} className="text-white text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Доступность</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {accessibilityOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`access-${item}`}
                checked={formData.accessibility.includes(item)}
                onCheckedChange={() => toggleArrayItem(formData.accessibility, item, 'accessibility')}
                className="border-white/20"
              />
              <Label htmlFor={`access-${item}`} className="text-white text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petPolicy" className="text-white">Политика по животным</Label>
          <Select value={formData.petPolicy} onValueChange={(value) => updateData('petPolicy', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите политику" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allowed">Разрешены</SelectItem>
              <SelectItem value="cats_only">Только кошки</SelectItem>
              <SelectItem value="small_pets">Только мелкие</SelectItem>
              <SelectItem value="negotiable">По договоренности</SelectItem>
              <SelectItem value="not_allowed">Не разрешены</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="smokingPolicy" className="text-white">Курение</Label>
          <Select value={formData.smokingPolicy} onValueChange={(value) => updateData('smokingPolicy', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Политика курения" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allowed">Разрешено</SelectItem>
              <SelectItem value="balcony_only">Только на балконе</SelectItem>
              <SelectItem value="not_allowed">Запрещено</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="additionalFeatures" className="text-white">Дополнительные особенности</Label>
        <Textarea
          id="additionalFeatures"
          value={formData.additionalFeatures}
          onChange={(e) => updateData('additionalFeatures', e.target.value)}
          placeholder="Опишите любые дополнительные удобства, особенности планировки, уникальные характеристики..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
        />
      </div>
    </div>
  );
};