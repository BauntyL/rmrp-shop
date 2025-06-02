-- Создаем таблицу для бэкапа
CREATE TABLE IF NOT EXISTS "users_backup" AS SELECT * FROM "users";

-- Создаем новые колонки без ограничений
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "new_email" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "new_username" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "new_password" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_banned" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ban_reason" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_image_url" text;

-- Обновляем данные
UPDATE "users" 
SET 
    "first_name" = SPLIT_PART(COALESCE("full_name", ' '), ' ', 1),
    "last_name" = CASE 
        WHEN POSITION(' ' IN COALESCE("full_name", ' ')) > 0 
        THEN SUBSTRING(COALESCE("full_name", ' ') FROM POSITION(' ' IN COALESCE("full_name", ' ')) + 1)
        ELSE ''
    END,
    "new_email" = "email",
    "new_username" = "username",
    "new_password" = "password_hash";

-- Проверяем на дубликаты email
CREATE OR REPLACE FUNCTION fix_duplicate_emails() RETURNS void AS $$
DECLARE
    duplicate_record RECORD;
BEGIN
    FOR duplicate_record IN 
        SELECT new_email, COUNT(*) 
        FROM users 
        GROUP BY new_email 
        HAVING COUNT(*) > 1
    LOOP
        UPDATE users 
        SET new_email = new_email || '_' || id 
        WHERE new_email = duplicate_record.new_email;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT fix_duplicate_emails();

-- Проверяем на дубликаты username
CREATE OR REPLACE FUNCTION fix_duplicate_usernames() RETURNS void AS $$
DECLARE
    duplicate_record RECORD;
BEGIN
    FOR duplicate_record IN 
        SELECT new_username, COUNT(*) 
        FROM users 
        GROUP BY new_username 
        HAVING COUNT(*) > 1
    LOOP
        UPDATE users 
        SET new_username = new_username || '_' || id 
        WHERE new_username = duplicate_record.new_username;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT fix_duplicate_usernames();

-- Удаляем старые колонки
ALTER TABLE "users" 
    DROP COLUMN IF EXISTS "full_name",
    DROP COLUMN IF EXISTS "email",
    DROP COLUMN IF EXISTS "username",
    DROP COLUMN IF EXISTS "password_hash";

-- Переименовываем новые колонки
ALTER TABLE "users" 
    RENAME COLUMN "new_email" TO "email";
ALTER TABLE "users" 
    RENAME COLUMN "new_username" TO "username";
ALTER TABLE "users" 
    RENAME COLUMN "new_password" TO "password";

-- Добавляем NOT NULL ограничения
ALTER TABLE "users" 
    ALTER COLUMN "first_name" SET NOT NULL,
    ALTER COLUMN "last_name" SET NOT NULL,
    ALTER COLUMN "email" SET NOT NULL,
    ALTER COLUMN "username" SET NOT NULL,
    ALTER COLUMN "password" SET NOT NULL,
    ALTER COLUMN "role" SET NOT NULL;

-- Добавляем уникальные индексы
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");

-- Обновляем типы timestamp колонок
ALTER TABLE "users" 
    ALTER COLUMN "created_at" TYPE timestamp,
    ALTER COLUMN "updated_at" TYPE timestamp; 