import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Home, DollarSign } from 'lucide-react';

interface RealEstateStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers?: any[];
  subcategories?: any[];
}

export const RealEstateStep1: React.FC<RealEstateStep1Props> = ({ 
  data, 
  onDataChange, 
  onValidationChange, 
  servers = [],
  subcategories = []
}) => {
  const [formData, setFormData] = useState({
    subcategoryId: data.subcategoryId || 0,
    serverId: data.serverId || 0,
    title: data.title || '',
    price: data.price || ''
  });

  const realEstateSubcategories = [
    { id: 1, name: "Квартира" },
    { id: 2, name: "Дом" },
    { id: 3, name: "Бизнес" },
    { id: 4, name: "Склад" }
  ];

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация: все поля обязательны
    const isValid = newData.subcategoryId > 0 && 
                   newData.serverId > 0 && 
                   newData.title.trim() !== '' && 
                   newData.price.trim() !== '' && 
                   parseFloat(newData.price) > 0;
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Home className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Тип и характеристики</h3>
        </div>
        <p className="text-white/80 text-sm">Основная информация о недвижимости</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subcategoryId" className="text-white">Тип недвижимости <span className="text-red-400">*</span></Label>
          <Select 
            value={formData.subcategoryId.toString()} 
            onValueChange={(value) => updateData('subcategoryId', parseInt(value))}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите тип недвижимости" />
            </SelectTrigger>
            <SelectContent>
              {realEstateSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="serverId" className="text-white">Сервер <span className="text-red-400">*</span></Label>
          <Select 
            value={formData.serverId.toString()} 
            onValueChange={(value) => updateData('serverId', parseInt(value))}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите сервер" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id.toString()}>
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="text-white">Название <span className="text-red-400">*</span></Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateData('title', e.target.value)}
          placeholder="Например: Продается 3-комнатная квартира в центре"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      <div>
        <Label htmlFor="price" className="text-white">Цена <span className="text-red-400">*</span></Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => updateData('price', e.target.value)}
            placeholder="1000000"
            min="0"
            step="1000"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
          />
        </div>
      </div>
    </div>
  );
};