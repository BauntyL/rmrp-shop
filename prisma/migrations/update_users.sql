-- Обновляем существующих пользователей
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Копируем хеши паролей из password_hash в password
UPDATE users 
SET password = password_hash 
WHERE password IS NULL AND password_hash IS NOT NULL;

-- Устанавливаем роль 'admin' для пользователя "Баунти Миллер"
UPDATE users 
SET role = 'admin' 
WHERE full_name = 'Баунти Миллер';

-- Удаляем старую колонку password_hash
ALTER TABLE users 
DROP COLUMN IF EXISTS password_hash; 