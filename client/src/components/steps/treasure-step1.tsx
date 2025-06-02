import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TreasureStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers: any[];
}

export default function TreasureStep1({ data, onDataChange, onValidationChange, servers }: TreasureStep1Props) {
  const [formData, setFormData] = useState({
    name: data.name || '',
    description: data.description || '',
    treasureType: data.treasureType || '',
    quantity: data.quantity || 1,
    rarity: data.rarity || '',
    condition: data.condition || '',
    price: data.price || '',
    serverId: data.serverId || '',
    location: data.location || '',
    ...data
  });

  const updateData = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = 
      newData.name.length > 0 &&
      newData.description.length >= 10 &&
      newData.treasureType.length > 0 &&
      newData.quantity > 0 &&
      newData.rarity.length > 0 &&
      newData.condition.length > 0 &&
      parseFloat(newData.price.toString()) > 0 &&
      newData.serverId.toString().length > 0 &&
      newData.location.length > 0;
    
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Основная информация и детали</h3>
        <p className="text-slate-400">Расскажите о вашем сокровище</p>
      </div>

      {/* Основная информация */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-300">Основная информация</h4>
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Название сокровища *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateData('name', e.target.value)}
            placeholder="Например: Древний амулет силы"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">Описание *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateData('description', e.target.value)}
            placeholder="Подробное описание сокровища, его истории и особенностей..."
            className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
          />
          <p className="text-xs text-slate-400">
            Минимум 10 символов. Текущая длина: {formData.description.length}
          </p>
        </div>
      </div>

      {/* Детали клада */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-300">Детали клада</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="treasureType" className="text-slate-300">Тип сокровища *</Label>
            <Select value={formData.treasureType} onValueChange={(value) => updateData('treasureType', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="weapon" className="text-white hover:bg-slate-700">Оружие</SelectItem>
                <SelectItem value="armor" className="text-white hover:bg-slate-700">Броня</SelectItem>
                <SelectItem value="jewelry" className="text-white hover:bg-slate-700">Украшения</SelectItem>
                <SelectItem value="artifact" className="text-white hover:bg-slate-700">Артефакт</SelectItem>
                <SelectItem value="scroll" className="text-white hover:bg-slate-700">Свиток</SelectItem>
                <SelectItem value="potion" className="text-white hover:bg-slate-700">Зелье</SelectItem>
                <SelectItem value="gem" className="text-white hover:bg-slate-700">Драгоценный камень</SelectItem>
                <SelectItem value="relic" className="text-white hover:bg-slate-700">Реликвия</SelectItem>
                <SelectItem value="other" className="text-white hover:bg-slate-700">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-slate-300">Количество *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => updateData('quantity', parseInt(e.target.value) || 1)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rarity" className="text-slate-300">Редкость *</Label>
            <Select value={formData.rarity} onValueChange={(value) => updateData('rarity', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите редкость" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="common" className="text-white hover:bg-slate-700">Обычное</SelectItem>
                <SelectItem value="uncommon" className="text-white hover:bg-slate-700">Необычное</SelectItem>
                <SelectItem value="rare" className="text-white hover:bg-slate-700">Редкое</SelectItem>
                <SelectItem value="epic" className="text-white hover:bg-slate-700">Эпическое</SelectItem>
                <SelectItem value="legendary" className="text-white hover:bg-slate-700">Легендарное</SelectItem>
                <SelectItem value="mythic" className="text-white hover:bg-slate-700">Мифическое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition" className="text-slate-300">Состояние *</Label>
            <Select value={formData.condition} onValueChange={(value) => updateData('condition', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите состояние" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="perfect" className="text-white hover:bg-slate-700">Идеальное</SelectItem>
                <SelectItem value="excellent" className="text-white hover:bg-slate-700">Отличное</SelectItem>
                <SelectItem value="good" className="text-white hover:bg-slate-700">Хорошее</SelectItem>
                <SelectItem value="fair" className="text-white hover:bg-slate-700">Удовлетворительное</SelectItem>
                <SelectItem value="poor" className="text-white hover:bg-slate-700">Плохое</SelectItem>
                <SelectItem value="damaged" className="text-white hover:bg-slate-700">Поврежденное</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Цена, сервер и местоположение */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-purple-300">Продажа</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-300">Цена *</Label>
            <Input
              id="price"
              type="number"
              min="1"
              step="0.01"
              value={formData.price}
              onChange={(e) => updateData('price', parseFloat(e.target.value) || 0)}
              placeholder="1000"
              className="bg-slate-800 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400">Цена в рублях</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverId" className="text-slate-300">Сервер *</Label>
            <Select value={formData.serverId.toString()} onValueChange={(value) => updateData('serverId', parseInt(value))}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите сервер" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {servers.map((server: any) => (
                  <SelectItem key={server.id} value={server.id.toString()} className="text-white hover:bg-slate-700">
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300">Местоположение *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateData('location', e.target.value)}
              placeholder="Город, район"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}