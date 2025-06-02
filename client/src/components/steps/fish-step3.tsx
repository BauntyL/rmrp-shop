import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FishStep3Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function FishStep3({ data, onDataChange, onValidationChange }: FishStep3Props) {
  const [formData, setFormData] = useState({
    images: data.images || [],
    location: data.location || '',
    contact: data.contact || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация
    const isValid = newData.location.length > 0 && newData.contact.length > 0;
    onValidationChange(isValid);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files];
    updateData('images', newImages);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    updateData('images', newImages);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Фотографии и контакты</h3>
        <p className="text-slate-400">Добавьте фото и укажите контактную информацию</p>
      </div>

      <div className="space-y-4">
        <Label className="text-slate-300">Фотографии рыбы</Label>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-400 mb-4">Перетащите фото сюда или нажмите для выбора</p>
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <label htmlFor="image-upload" className="cursor-pointer">
              Выбрать файлы
            </label>
          </Button>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((image: File, index: number) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="space-y-2">
          <Label htmlFor="contact" className="text-slate-300">Контакт *</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={(e) => updateData('contact', e.target.value)}
            placeholder="Телефон или email"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
}