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
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="category" className="text-slate-300">Категория *</Label>
          <Select
            value={formData.categoryId?.toString()}
            onValueChange={(value) => updateData('categoryId', parseInt(value))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {categories?.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id.toString()}
                  className="text-white hover:bg-slate-700"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.categoryId && subcategories?.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="subcategory" className="text-slate-300">Подкатегория</Label>
            <Select
              value={formData.subcategoryId?.toString()}
              onValueChange={(value) => updateData('subcategoryId', parseInt(value))}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Выберите подкатегорию" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {subcategories.map((subcategory) => (
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
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Описание *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateData('description', e.target.value)}
          className="bg-slate-800 border-slate-600 text-white h-24"
          placeholder="Опишите ваш товар..."
        />
      </div>
    </div>
  );
};

export default ListingStep1;