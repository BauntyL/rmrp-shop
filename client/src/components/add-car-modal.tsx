import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { NotificationModal } from './ui/notification-modal';

const carSchema = z.object({
  brand: z.string().min(1, 'Укажите марку автомобиля'),
  model: z.string().min(1, 'Укажите модель автомобиля'),
  year: z.string()
    .regex(/^\d{4}$/, 'Год должен быть в формате YYYY')
    .refine((val) => {
      const year = parseInt(val);
      return year >= 1900 && year <= new Date().getFullYear();
    }, 'Некорректный год'),
  price: z.string()
    .regex(/^\d+$/, 'Введите числовое значение')
    .refine((val) => parseInt(val) > 0, 'Цена должна быть больше 0'),
  description: z.string().min(10, 'Минимум 10 символов').max(1000, 'Максимум 1000 символов'),
  images: z.array(z.string()).min(1, 'Добавьте хотя бы одно фото')
});

export function AddCarModal({ isOpen, onClose }) {
  const [notification, setNotification] = React.useState({ show: false, title: '', message: '', type: 'info' });
  const [images, setImages] = React.useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(carSchema)
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setImages(prev => [...prev, ...data.urls]);
      } else {
        throw new Error('Ошибка загрузки изображений');
      }
    } catch (error) {
      showNotification('Ошибка', 'Не удалось загрузить изображения', 'error');
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          images,
          status: 'pending'
        })
      });

      if (response.ok) {
        showNotification(
          'Успешно',
          'Ваше объявление отправлено на модерацию. После проверки оно появится в каталоге.',
          'success'
        );
        reset();
        setImages([]);
        setTimeout(onClose, 3000);
      } else {
        throw new Error('Ошибка создания объявления');
      }
    } catch (error) {
      showNotification('Ошибка', 'Не удалось создать объявление', 'error');
    }
  };

  const showNotification = (title, message, type) => {
    setNotification({
      show: true,
      title,
      message,
      type
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить автомобиль</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register('brand')}
                placeholder="Марка автомобиля"
                className={errors.brand ? 'border-red-500' : ''}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <Input
                {...register('model')}
                placeholder="Модель"
                className={errors.model ? 'border-red-500' : ''}
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>

            <div>
              <Input
                {...register('year')}
                placeholder="Год выпуска (YYYY)"
                className={errors.year ? 'border-red-500' : ''}
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>

            <div>
              <Input
                {...register('price')}
                placeholder="Цена (₽)"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Textarea
                {...register('description')}
                placeholder="Описание автомобиля"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit">
                Отправить на модерацию
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NotificationModal
        isOpen={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
}
