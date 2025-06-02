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
    <div className="space-y-4 h-full">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Home className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Тип и характеристики</h3>
        </div>
        <p className="text-white/80 text-sm">Основная информация о недвижимости</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subcategory" className="text-slate-300">Тип недвижимости *</Label>
          <Select
            value={formData.subcategoryId?.toString()}
            onValueChange={(value) => updateData('subcategoryId', parseInt(value))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {subcategories?.map((subcategory) => (
                <SelectItem 
                  key={subcategory.id} 
                  value={subcategory.id.toString()}
                  className="text-white hover:bg-slate-700"
                >
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="server" className="text-slate-300">Сервер *</Label>
          <Select
            value={formData.serverId?.toString()}
            onValueChange={(value) => updateData('serverId', parseInt(value))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите сервер" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {servers?.map((server) => (
                <SelectItem 
                  key={server.id} 
                  value={server.id.toString()}
                  className="text-white hover:bg-slate-700"
                >
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">Название *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateData('title', e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
            placeholder="Введите название"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-slate-300">Цена *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => updateData('price', parseInt(e.target.value) || 0)}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
};