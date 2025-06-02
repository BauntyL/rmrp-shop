import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FishStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FishStep2({ data, onDataChange, onValidationChange }: FishStep2Props) {
  const [formData, setFormData] = useState({
    species: data.species || '',
    weight: data.weight || '',
    length: data.length || '',
    catchMethod: data.catchMethod || '',
    bait: data.bait || '',
    weatherConditions: data.weatherConditions || '',
    waterTemperature: data.waterTemperature || '',
    notes: data.notes || '',
    ...data
  });

  const updateData = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  useEffect(() => {
    // Проверяем обязательные поля
    const isValid = formData.species.length > 0 && formData.weight.length > 0;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Детали рыбы</h3>
        <p className="text-slate-400">Укажите подробную информацию о вашем улове</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="species" className="text-slate-300">Вид рыбы *</Label>
          <Input
            id="species"
            value={formData.species}
            onChange={(e) => updateData('species', e.target.value)}
            placeholder="Например: Щука, Окунь, Карп"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight" className="text-slate-300">Вес (кг) *</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => updateData('weight', e.target.value)}
            placeholder="2.5"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="length" className="text-slate-300">Длина (см)</Label>
          <Input
            id="length"
            type="number"
            value={formData.length}
            onChange={(e) => updateData('length', e.target.value)}
            placeholder="45"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="catchMethod" className="text-slate-300">Способ ловли</Label>
          <Select value={formData.catchMethod} onValueChange={(value) => updateData('catchMethod', value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите способ ловли" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spinning">Спиннинг</SelectItem>
              <SelectItem value="feeder">Фидер</SelectItem>
              <SelectItem value="float">Поплавочная удочка</SelectItem>
              <SelectItem value="fly">Нахлыст</SelectItem>
              <SelectItem value="trolling">Троллинг</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bait" className="text-slate-300">Приманка/наживка</Label>
          <Input
            id="bait"
            value={formData.bait}
            onChange={(e) => updateData('bait', e.target.value)}
            placeholder="Воблер, червь, блесна..."
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waterTemperature" className="text-slate-300">Температура воды (°C)</Label>
          <Input
            id="waterTemperature"
            type="number"
            value={formData.waterTemperature}
            onChange={(e) => updateData('waterTemperature', e.target.value)}
            placeholder="15"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weatherConditions" className="text-slate-300">Погодные условия</Label>
        <Input
          id="weatherConditions"
          value={formData.weatherConditions}
          onChange={(e) => updateData('weatherConditions', e.target.value)}
          placeholder="Солнечно, ветрено, дождь..."
          className="bg-slate-800 border-slate-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-slate-300">Дополнительные заметки</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => updateData('notes', e.target.value)}
          placeholder="Особенности ловли, интересные моменты..."
          className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
        />
      </div>
    </div>
  );
}