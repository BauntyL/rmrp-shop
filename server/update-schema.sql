-- Добавляем недостающие колонки в таблицу categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'fas fa-folder',
ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT 'gray'; 