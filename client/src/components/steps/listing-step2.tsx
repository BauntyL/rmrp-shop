import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Upload, X, Image } from 'lucide-react';

interface ListingStep2Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const ListingStep2: React.FC<ListingStep2Props> = ({ 
  data, 
  onDataChange, 
  onValidationChange 
}) => {
  const [formData, setFormData] = useState({
    imageUrl: data.imageUrl || '',
    images: data.images || [],
    additionalInfo: data.additionalInfo || '',
    ...data
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  useEffect(() => {
    // Валидация - изображение не обязательно для общих объявлений
    onValidationChange(true);
  }, [formData, onValidationChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImages = [...formData.images, {
            id: Date.now() + Math.random(),
            url: e.target?.result as string,
            file: file,
            name: file.name
          }];
          updateData('images', newImages);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId: number) => {
    const newImages = formData.images.filter((img: any) => img.id !== imageId);
    updateData('images', newImages);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-violet-400 mb-2">Детали товара</h3>
        <p className="text-slate-400">Добавьте изображения и дополнительную информацию</p>
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Ссылка на изображение (необязательно)</Label>
        <Input 
          placeholder="https://example.com/image.jpg" 
          value={formData.imageUrl}
          onChange={(e) => updateData('imageUrl', e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <Label className="text-white font-medium flex items-center gap-2">
          <Image className="h-4 w-4" />
          Загрузить изображения
        </Label>
        
        <div className="border-2 border-dashed border-slate-600/50 rounded-xl p-6 text-center hover:border-violet-500/50 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400">Нажмите для загрузки изображений</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF до 10MB</p>
          </label>
        </div>

        {/* Uploaded Images */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image: any, index: number) => (
              <div key={image.id} className="relative group">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="w-full h-24 object-cover rounded-lg border border-slate-600/50"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="space-y-2">
        <Label className="text-white font-medium">Дополнительная информация (необязательно)</Label>
        <Input 
          placeholder="Любая дополнительная информация о товаре" 
          value={formData.additionalInfo}
          onChange={(e) => updateData('additionalInfo', e.target.value)}
          className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-violet-500/50 transition-colors"
        />
      </div>
    </div>
  );
};

export default ListingStep2;