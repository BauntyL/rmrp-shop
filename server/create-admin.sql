-- Проверяем существование пользователя
DO $$
DECLARE
    user_exists boolean;
    user_id integer;
BEGIN
    -- Проверяем существование пользователя
    SELECT EXISTS (
        SELECT 1 FROM users WHERE username = 'Баунти Миллер'
    ) INTO user_exists;

    IF user_exists THEN
        -- Если пользователь существует, обновляем его роль до админа
        UPDATE users 
        SET role = 'admin'
        WHERE username = 'Баунти Миллер'
        RETURNING id INTO user_id;
        
        RAISE NOTICE 'Пользователь обновлен до админа (ID: %)', user_id;
    ELSE
        -- Если пользователь не существует, создаем нового админа
        -- Пароль: Lqlcpyvb555!999#81
        INSERT INTO users (username, password, role)
        VALUES (
            'Баунти Миллер',
            '$2b$10$V9xjSXjKxQ1zRiRaKXTL2OUq6R3fvtBKHBgXL4tZG7XshszERWoZm',
            'admin'
        )
        RETURNING id INTO user_id;
        
        RAISE NOTICE 'Создан новый админ (ID: %)', user_id;
    END IF;
END $$; 