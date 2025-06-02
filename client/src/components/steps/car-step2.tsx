import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface CarStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const CarStep2: React.FC<CarStep2Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    color: data.color || '',
    interiorColor: data.interiorColor || '',
    driveType: data.driveType || '',
    owners: data.owners || '',
    accidents: data.accidents || false,
    serviceHistory: data.serviceHistory || false,
    equipment: data.equipment || [],
    defects: data.defects || '',
    modifications: data.modifications || '',
    warranty: data.warranty || false,
    warrantyDetails: data.warrantyDetails || ''
  });

  const equipmentOptions = [
    'Кондиционер', 'Климат-контроль', 'Подогрев сидений', 'Кожаный салон',
    'Электростеклоподъемники', 'Центральный замок', 'Сигнализация',
    'Парктроник', 'Камера заднего вида', 'Навигация', 'Bluetooth',
    'USB', 'AUX', 'Круиз-контроль', 'ESP', 'ABS', 'Подушки безопасности',
    'Ксенон', 'LED фары', 'Люк', 'Тонировка', 'Литые диски'
  ];

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация (все поля опциональные на этом шаге)
    onValidationChange(true);
  };

  const toggleEquipment = (item: string) => {
    const newEquipment = formData.equipment.includes(item)
      ? formData.equipment.filter((eq: string) => eq !== item)
      : [...formData.equipment, item];
    updateData('equipment', newEquipment);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Техническое состояние</h3>
        <p className="text-white/80 text-sm">Укажите детали о состоянии и комплектации</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="color" className="text-white">Цвет кузова</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => updateData('color', e.target.value)}
            placeholder="Белый, черный, серебристый..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="interiorColor" className="text-white">Цвет салона</Label>
          <Input
            id="interiorColor"
            value={formData.interiorColor}
            onChange={(e) => updateData('interiorColor', e.target.value)}
            placeholder="Черный, бежевый, серый..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <div>
          <Label htmlFor="driveType" className="text-white">Привод</Label>
          <Select value={formData.driveType} onValueChange={(value) => updateData('driveType', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Выберите тип привода" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="front">Передний</SelectItem>
              <SelectItem value="rear">Задний</SelectItem>
              <SelectItem value="all">Полный</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="owners" className="text-white">Количество владельцев</Label>
          <Input
            id="owners"
            type="number"
            value={formData.owners}
            onChange={(e) => updateData('owners', e.target.value)}
            placeholder="1"
            min="1"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accidents"
            checked={formData.accidents}
            onCheckedChange={(checked) => updateData('accidents', checked)}
            className="border-white/20"
          />
          <Label htmlFor="accidents" className="text-white">Участвовал в ДТП</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="serviceHistory"
            checked={formData.serviceHistory}
            onCheckedChange={(checked) => updateData('serviceHistory', checked)}
            className="border-white/20"
          />
          <Label htmlFor="serviceHistory" className="text-white">Есть история обслуживания</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="warranty"
            checked={formData.warranty}
            onCheckedChange={(checked) => updateData('warranty', checked)}
            className="border-white/20"
          />
          <Label htmlFor="warranty" className="text-white">Есть гарантия</Label>
        </div>
      </div>

      {formData.warranty && (
        <div>
          <Label htmlFor="warrantyDetails" className="text-white">Детали гарантии</Label>
          <Input
            id="warrantyDetails"
            value={formData.warrantyDetails}
            onChange={(e) => updateData('warrantyDetails', e.target.value)}
            placeholder="До какого числа, что покрывает..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      )}

      <div>
        <Label className="text-white mb-3 block">Комплектация</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {equipmentOptions.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={item}
                checked={formData.equipment.includes(item)}
                onCheckedChange={() => toggleEquipment(item)}
                className="border-white/20"
              />
              <Label htmlFor={item} className="text-white text-sm">{item}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="defects" className="text-white">Дефекты и недостатки</Label>
        <Textarea
          id="defects"
          value={formData.defects}
          onChange={(e) => updateData('defects', e.target.value)}
          placeholder="Опишите все известные проблемы и дефекты..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="modifications" className="text-white">Модификации и тюнинг</Label>
        <Textarea
          id="modifications"
          value={formData.modifications}
          onChange={(e) => updateData('modifications', e.target.value)}
          placeholder="Опишите все изменения от заводской комплектации..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
        />
      </div>
    </div>
  );
};