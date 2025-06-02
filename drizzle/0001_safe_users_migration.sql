-- Создаем временные колонки
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name_temp" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name_temp" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_temp" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username_temp" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_temp" text;

-- Копируем данные из full_name в first_name и last_name
UPDATE "users" 
SET "first_name_temp" = SPLIT_PART("full_name", ' ', 1),
    "last_name_temp" = SUBSTRING("full_name" FROM POSITION(' ' IN "full_name") + 1);

-- Копируем существующие данные
UPDATE "users"
SET "email_temp" = "email",
    "username_temp" = "username",
    "password_temp" = "password_hash";

-- Удаляем старые колонки
ALTER TABLE "users" DROP COLUMN IF EXISTS "full_name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
ALTER TABLE "users" DROP COLUMN IF EXISTS "username";

-- Переименовываем временные колонки в финальные
ALTER TABLE "users" RENAME COLUMN "first_name_temp" TO "first_name";
ALTER TABLE "users" RENAME COLUMN "last_name_temp" TO "last_name";
ALTER TABLE "users" RENAME COLUMN "email_temp" TO "email";
ALTER TABLE "users" RENAME COLUMN "username_temp" TO "username";
ALTER TABLE "users" RENAME COLUMN "password_temp" TO "password";

-- Добавляем NOT NULL ограничения
ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;

-- Добавляем уникальные индексы
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");

-- Обновляем типы timestamp колонок
ALTER TABLE "users" ALTER COLUMN "created_at" TYPE timestamp;
ALTER TABLE "users" ALTER COLUMN "updated_at" TYPE timestamp; 