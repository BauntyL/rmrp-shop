import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Home, MapPin, Ruler, Bed } from 'lucide-react';

interface RealEstateStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep1: React.FC<RealEstateStep1Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    // Основная информация
    propertyType: data.propertyType || '',
    dealType: data.dealType || '',
    title: data.title || '',
    address: data.address || '',
    district: data.district || '',
    totalArea: data.totalArea || '',
    livingArea: data.livingArea || '',
    kitchenArea: data.kitchenArea || '',
    rooms: data.rooms || '',
    bedrooms: data.bedrooms || '',
    bathrooms: data.bathrooms || '',
    floor: data.floor || '',
    totalFloors: data.totalFloors || '',
    buildingType: data.buildingType || '',
    yearBuilt: data.yearBuilt || '',
    condition: data.condition || '',
    description: data.description || '',
    // Удобства и инфраструктура
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
    'Спортзал', 'Бассейн', 'Парк', 'Метро', 'Автобусная остановка'
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
    
    // Валидация основных полей
    const isValid = newData.propertyType && newData.dealType && newData.title && 
                   newData.address && newData.totalArea;
    onValidationChange(isValid);
  };

  const toggleArrayItem = (array: string[], item: string, field: string) => {
    const newArray = array.includes(item)
      ? array.filter((i: string) => i !== item)
      : [...array, item];
    updateData(field, newArray);
  };

  return (
    <div className="space-y-8">
      {/* Основная информация */}
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Home className="h-6 w-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">Основная информация</h3>
          </div>
          <p className="text-slate-400">Укажите тип недвижимости и основные характеристики</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyType" className="text-white">Тип недвижимости *</Label>
            <Select value={formData.propertyType} onValueChange={(value) => updateData('propertyType', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Квартира</SelectItem>
                <SelectItem value="house">Дом</SelectItem>
                <SelectItem value="townhouse">Таунхаус</SelectItem>
                <SelectItem value="cottage">Коттедж</SelectItem>
                <SelectItem value="room">Комната</SelectItem>
                <SelectItem value="studio">Студия</SelectItem>
                <SelectItem value="commercial">Коммерческая</SelectItem>
                <SelectItem value="land">Земельный участок</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dealType" className="text-white">Тип сделки *</Label>
            <Select value={formData.dealType} onValueChange={(value) => updateData('dealType', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Выберите тип сделки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Продажа</SelectItem>
                <SelectItem value="rent">Аренда</SelectItem>
                <SelectItem value="daily_rent">Посуточная аренда</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="title" className="text-white">Заголовок объявления *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateData('title', e.target.value)}
            placeholder="Например: 3-комнатная квартира в центре города"
            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address" className="text-white flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Адрес *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateData('address', e.target.value)}
              placeholder="Улица, дом, квартира"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="district" className="text-white">Район/Округ</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => updateData('district', e.target.value)}
              placeholder="Центральный, Северный..."
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="totalArea" className="text-white flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Общая площадь (м²) *
            </Label>
            <Input
              id="totalArea"
              type="number"
              step="0.1"
              value={formData.totalArea}
              onChange={(e) => updateData('totalArea', e.target.value)}
              placeholder="85.5"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="livingArea" className="text-white">Жилая площадь (м²)</Label>
            <Input
              id="livingArea"
              type="number"
              step="0.1"
              value={formData.livingArea}
              onChange={(e) => updateData('livingArea', e.target.value)}
              placeholder="65.2"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="kitchenArea" className="text-white">Площадь кухни (м²)</Label>
            <Input
              id="kitchenArea"
              type="number"
              step="0.1"
              value={formData.kitchenArea}
              onChange={(e) => updateData('kitchenArea', e.target.value)}
              placeholder="12.0"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rooms" className="text-white flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Количество комнат
            </Label>
            <Select value={formData.rooms} onValueChange={(value) => updateData('rooms', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Комнат" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Студия</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6+">6+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bedrooms" className="text-white">Спальни</Label>
            <Input
              id="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => updateData('bedrooms', e.target.value)}
              placeholder="2"
              min="0"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="bathrooms" className="text-white">Санузлы</Label>
            <Input
              id="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => updateData('bathrooms', e.target.value)}
              placeholder="1"
              min="0"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="floor" className="text-white">Этаж</Label>
            <Input
              id="floor"
              type="number"
              value={formData.floor}
              onChange={(e) => updateData('floor', e.target.value)}
              placeholder="5"
              min="0"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="totalFloors" className="text-white">Этажей в доме</Label>
            <Input
              id="totalFloors"
              type="number"
              value={formData.totalFloors}
              onChange={(e) => updateData('totalFloors', e.target.value)}
              placeholder="9"
              min="1"
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="buildingType" className="text-white">Тип дома</Label>
            <Select value={formData.buildingType} onValueChange={(value) => updateData('buildingType', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Тип дома" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="panel">Панельный</SelectItem>
                <SelectItem value="brick">Кирпичный</SelectItem>
                <SelectItem value="monolith">Монолитный</SelectItem>
                <SelectItem value="new_building">Новостройка</SelectItem>
                <SelectItem value="wooden">Деревянный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="yearBuilt" className="text-white">Год постройки</Label>
            <Input
              id="yearBuilt"
              type="number"
              value={formData.yearBuilt}
              onChange={(e) => updateData('yearBuilt', e.target.value)}
              placeholder="2010"
              min="1800"
              max={new Date().getFullYear()}
              className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="condition" className="text-white">Состояние</Label>
          <Select value={formData.condition} onValueChange={(value) => updateData('condition', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
              <SelectValue placeholder="Выберите состояние" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Новое</SelectItem>
              <SelectItem value="excellent">Отличное</SelectItem>
              <SelectItem value="good">Хорошее</SelectItem>
              <SelectItem value="renovation_needed">Требует ремонта</SelectItem>
              <SelectItem value="under_construction">Строящееся</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description" className="text-white">Описание</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateData('description', e.target.value)}
            placeholder="Подробное описание недвижимости, особенности, преимущества..."
            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 min-h-[100px]"
          />
        </div>
      </div>

      {/* Удобства и инфраструктура */}
      <div className="space-y-6 border-t border-slate-600/30 pt-8">
        <div className="text-center mb-6">
          <h4 className="text-lg font-semibold text-emerald-400 mb-2">Удобства и инфраструктура</h4>
          <p className="text-slate-400">Укажите доступные удобства и близлежащую инфраструктуру</p>
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
                  className="border-slate-500"
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
                  className="border-slate-500"
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
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Выберите тип парковки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Нет</SelectItem>
                <SelectItem value="street">Уличная</SelectItem>
                <SelectItem value="yard">Во дворе</SelectItem>
                <SelectItem value="underground">Подземная</SelectItem>
                <SelectItem value="garage">Гараж</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="balcony" className="text-white">Балкон/Лоджия</Label>
            <Select value={formData.balcony} onValueChange={(value) => updateData('balcony', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
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
                  className="border-slate-500"
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
                  className="border-slate-500"
                />
                <Label htmlFor={`security-${item}`} className="text-white text-sm">{item}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="petPolicy" className="text-white">Политика по животным</Label>
            <Select value={formData.petPolicy} onValueChange={(value) => updateData('petPolicy', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Выберите политику" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allowed">Разрешены</SelectItem>
                <SelectItem value="cats_only">Только кошки</SelectItem>
                <SelectItem value="small_pets">Только мелкие</SelectItem>
                <SelectItem value="not_allowed">Не разрешены</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="smokingPolicy" className="text-white">Курение</Label>
            <Select value={formData.smokingPolicy} onValueChange={(value) => updateData('smokingPolicy', value)}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white">
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
            placeholder="Опишите любые дополнительные удобства, особенности планировки..."
            className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
};