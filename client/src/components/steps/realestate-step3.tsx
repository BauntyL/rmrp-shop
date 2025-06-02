import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Upload, X, Camera, Home } from 'lucide-react';

interface RealEstateStep3Props {
  data: any;
  onDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const RealEstateStep3: React.FC<RealEstateStep3Props> = ({ data, onDataChange, onValidationChange }) => {
  const [formData, setFormData] = useState({
    images: data.images || [],
    mainImageIndex: data.mainImageIndex || 0
  });

  const updateData = (newData: any) => {
    setFormData(newData);
    onDataChange(newData);
    
    // Валидация - хотя бы одно фото
    onValidationChange(newData.images.length > 0);
  };

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
          updateData({ ...formData, images: newImages });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId: number) => {
    const newImages = formData.images.filter((img: any) => img.id !== imageId);
    const newMainIndex = formData.mainImageIndex >= newImages.length ? 0 : formData.mainImageIndex;
    updateData({ ...formData, images: newImages, mainImageIndex: newMainIndex });
  };

  const setMainImage = (index: number) => {
    updateData({ ...formData, mainImageIndex: index });
  };

  const photoCategories = [
    { name: 'Общий вид', description: 'Фасад здания, вход' },
    { name: 'Гостиная', description: 'Основная жилая комната' },
    { name: 'Кухня', description: 'Кухонная зона, техника' },
    { name: 'Спальни', description: 'Все спальные комнаты' },
    { name: 'Санузел', description: 'Ванная, туалет' },
    { name: 'Балкон/Лоджия', description: 'Вид с балкона' },
    { name: 'Планировка', description: 'План квартиры/дома' },
    { name: 'Двор/Территория', description: 'Придомовая территория' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Фотографии недвижимости</h3>
        <p className="text-white/80 text-sm">Добавьте качественные фото для привлечения покупателей</p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Home className="w-4 h-4 mr-2" />
          Рекомендуемые фотографии
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {photoCategories.map((category, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div className="text-white text-sm font-medium">{category.name}</div>
                <div className="text-white/70 text-xs">{category.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="realestate-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-white/70" />
              <p className="mb-2 text-sm text-white/70">
                <span className="font-semibold">Нажмите для загрузки</span> или перетащите файлы
              </p>
              <p className="text-xs text-white/50">PNG, JPG, JPEG (макс. 10MB каждый)</p>
            </div>
            <input
              id="realestate-images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {formData.images.length > 0 && (
          <div>
            <Label className="text-white mb-3 block">Загруженные фотографии ({formData.images.length})</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.map((image: any, index: number) => (
                <div key={image.id} className="relative group">
                  <div className={`relative rounded-lg overflow-hidden ${index === formData.mainImageIndex ? 'ring-2 ring-green-400' : ''}`}>
                    <img
                      src={image.url}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMainImage(index)}
                        className="text-xs"
                      >
                        {index === formData.mainImageIndex ? 'Главное' : 'Сделать главным'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {index === formData.mainImageIndex && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Главное
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.images.length === 0 && (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50">Фотографии не загружены</p>
            <p className="text-white/30 text-sm">Добавьте хотя бы одну фотографию для продолжения</p>
          </div>
        )}
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <h4 className="text-green-400 font-medium mb-2">📸 Советы для лучших фотографий:</h4>
        <ul className="text-green-300/80 text-sm space-y-1">
          <li>• Фотографируйте при естественном освещении</li>
          <li>• Покажите все комнаты и важные зоны</li>
          <li>• Сделайте фото планировки или схемы</li>
          <li>• Уберите лишние предметы перед съемкой</li>
          <li>• Покажите вид из окон</li>
          <li>• Сфотографируйте придомовую территорию</li>
          <li>• Добавьте фото документов (скройте личные данные)</li>
        </ul>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <h4 className="text-yellow-400 font-medium mb-2">⚠️ Важно:</h4>
        <ul className="text-yellow-300/80 text-sm space-y-1">
          <li>• Фотографии должны соответствовать действительности</li>
          <li>• Не используйте фото из интернета</li>
          <li>• Покажите реальное состояние объекта</li>
          <li>• Укажите дефекты, если они есть</li>
        </ul>
      </div>
    </div>
  );
};