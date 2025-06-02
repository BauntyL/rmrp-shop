import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Car, Home, Fish, Gem, Package } from 'lucide-react';

interface ListingStep1Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  categories?: any[];
  subcategories?: any[];
}

export const ListingStep1: React.FC<ListingStep1Props> = ({ 
  data, 
  onDataChange, 
  onValidationChange, 
  categories = [],
  subcategories = []
}) => {
  const [formData, setFormData] = useState({
    categoryId: data.categoryId || 0,
    subcategoryId: data.subcategoryId || 0,
    title: data.title || '',
    description: data.description || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  useEffect(() => {
    const isValid = formData.categoryId > 0 && 
                   formData.title.length > 0 && 
                   formData.description.length >= 10;
    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "cars": return <Car className="h-5 w-5" />;
      case "realestate": return <Home className="h-5 w-5" />;
      case "fish": return <Fish className="h-5 w-5" />;
      case "treasures": return <Gem className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryGradient = (name: string) => {
    switch (name) {
      case "cars": return "from-red-500/20 to-orange-500/20 border-red-500/30";
      case "realestate": return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "fish": return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      case "treasures": return "from-purple-500/20 to-pink-500/20 border-purple-500/30";
      default: return "from-slate-500/20 to-gray-500/20 border-slate-500/30";
    }
  };

  const mainCategories = categories.filter((cat: any) => !cat.parentId);
  const currentSubcategories = subcategories.filter((sub: any) => sub.parentId === formData.categoryId);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-violet-400 mb-2">Основная информация</h3>
        <p className="text-slate-400">Выберите категорию и опишите ваш товар</p>
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <Label className="text-white font-medium">Категория товара</Label>
        <RadioGroup
          value={formData.categoryId?.toString()}
          onValueChange={(value) => {
            const categoryId = parseInt(value);
            updateData('categoryId', categoryId);
            updateData('subcategoryId', 0); // Reset subcategory
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {mainCategories.map((category: any) => (
            <div key={category.id} className="relative group">
              <RadioGroupItem 
                value={category.id.toString()} 
                id={category.id.toString()} 
                className="sr-only" 
              />
              <Label 
                htmlFor={category.id.toString()} 
                className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  formData.categoryId === category.id 
                    ? `bg-gradient-to-r ${getCategoryGradient(category.name)} border-opacity-100` 
                    : 'bg-slate-800/30 border-slate-600/50 hover:border-slate-500/70'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  formData.categoryId === category.id 
                    ? 'bg-white/10' 
                    : 'bg-slate-700/50'
                }`}>
                  {getCategoryIcon(category.name)}
                </div>
                <span className="font-medium text-white">{category.displayName}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Subcategory Selection */}
      {formData.categoryId > 0 && currentSubcategories.length > 0 && (
        <div className="space-y-4">
          <Label className="text-white font-medium">Подкатегория</Label>
          <Select 
            onValueChange={(value) => updateData('subcategoryId', parseInt(value))} 
            value={formData.subcategoryId?.toString()}
          >
            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white hover:border-purple-500/50 transition-colors">
              <SelectValue placeholder="Выберите подкатегорию" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {currentSubcategories.map((subcategory: any) => (
                <SelectItem key={subcategory.id} value={subcategory.id.toString()} className="text-white hover:bg-slate-700">
                  {subcategory.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Название товара</Label>
        <Input 
          placeholder="Краткое описание товара" 
          value={formData.title}
          onChange={(e) => updateData('title', e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Описание</Label>
        <Textarea 
          placeholder="Подробное описание товара" 
          rows={4}
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-emerald-500/50 transition-colors resize-none"
        />
        <p className="text-xs text-slate-400">Минимум 10 символов</p>
      </div>
    </div>
  );
};

export default ListingStep1;