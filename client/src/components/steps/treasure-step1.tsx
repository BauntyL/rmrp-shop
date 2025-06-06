import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Server } from '@shared/schema';

interface TreasureStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  servers: Server[];
}

export default function TreasureStep1({ data, onDataChange, onValidationChange, servers }: TreasureStep1Props) {
  const [formData, setFormData] = useState({
    treasureType: data.treasureType || '',
    quantity: data.quantity || 1,
    description: data.description || '',
    price: data.price || '',
    serverId: data.serverId || '',
    ...data
  });

  const updateData = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = 
      newData.treasureType.length > 0 &&
      newData.quantity > 0 &&
      newData.description.length >= 10 &&
      parseFloat(newData.price.toString()) > 0 &&
      newData.serverId.toString().length > 0;
    
    onValidationChange(isValid);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Основная информация</h3>
        <p className="text-slate-400">Расскажите о вашем сокровище</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="treasureType" className="text-slate-300">Тип сокровища *</Label>
          <Input
            id="treasureType"
            type="text"
            value={formData.treasureType}
            onChange={(e) => updateData('treasureType', e.target.value)}
            placeholder="Например: Оружие, Броня, Украшения, Артефакт и т.д."
            className="bg-slate-800 border-slate-600 text-white"
          />
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

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">Описание *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateData('description', e.target.value)}
            placeholder="Подробное описание сокровища, его особенностей и характеристик..."
            className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
          />
          <p className="text-xs text-slate-400">
            Минимум 10 символов. Текущая длина: {formData.description.length}
          </p>
        </div>

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
      </div>
    </div>
  );
} 