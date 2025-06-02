import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

interface RealEstateStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep1: React.FC<RealEstateStep1Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
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
    description: data.description || ''
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.propertyType && newData.dealType && newData.title && 
                   newData.address && newData.totalArea;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Основная информация</h3>
        <p className="text-white/80 text-sm">Укажите тип недвижимости и основные характеристики</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="propertyType" className="text-white">Тип недвижимости *</Label>
          <Select value={formData.propertyType} onValueChange={(value) => updateData('propertyType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Квартира</SelectItem>
              <SelectItem value="house">Дом</SelectItem>
              <SelectItem value="townhouse">Таунхаус</SelectItem>
              <SelectItem value="cottage">Коттедж</SelectItem>
              <SelectItem value="room">Комната</SelectItem>
              <SelectItem value="studio">Студия</SelectItem>
              <SelectItem value="penthouse">Пентхаус</SelectItem>
              <SelectItem value="duplex">Дуплекс</SelectItem>
              <SelectItem value="commercial">Коммерческая</SelectItem>
              <SelectItem value="office">Офис</SelectItem>
              <SelectItem value="warehouse">Склад</SelectItem>
              <SelectItem value="land">Земельный участок</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dealType" className="text-white">Тип сделки *</Label>
          <Select value={formData.dealType} onValueChange={(value) => updateData('dealType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address" className="text-white">Адрес *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateData('address', e.target.value)}
            placeholder="Улица, дом, квартира"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="district" className="text-white">Район/Округ</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => updateData('district', e.target.value)}
            placeholder="Центральный, Северный..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="totalArea" className="text-white">Общая площадь (м²) *</Label>
          <Input
            id="totalArea"
            type="number"
            step="0.1"
            value={formData.totalArea}
            onChange={(e) => updateData('totalArea', e.target.value)}
            placeholder="85.5"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="rooms" className="text-white">Количество комнат</Label>
          <Select value={formData.rooms} onValueChange={(value) => updateData('rooms', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="buildingType" className="text-white">Тип дома</Label>
          <Select value={formData.buildingType} onValueChange={(value) => updateData('buildingType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Тип дома" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="panel">Панельный</SelectItem>
              <SelectItem value="brick">Кирпичный</SelectItem>
              <SelectItem value="monolith">Монолитный</SelectItem>
              <SelectItem value="stalin">Сталинский</SelectItem>
              <SelectItem value="khrushchev">Хрущевка</SelectItem>
              <SelectItem value="brezhnevka">Брежневка</SelectItem>
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="condition" className="text-white">Состояние</Label>
        <Select value={formData.condition} onValueChange={(value) => updateData('condition', value)}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Выберите состояние" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Новое</SelectItem>
            <SelectItem value="excellent">Отличное</SelectItem>
            <SelectItem value="good">Хорошее</SelectItem>
            <SelectItem value="renovation_needed">Требует ремонта</SelectItem>
            <SelectItem value="major_renovation">Требует капремонта</SelectItem>
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
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
        />
      </div>
    </div>
  );
};