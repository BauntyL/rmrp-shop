app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('=== LOGIN DEBUG ===');
  console.log('Попытка входа:', { username });

  try {
    // Загружаем пользователя из БД
    const user = await getUserByUsername(username);
    console.log('Найденный пользователь из БД:', user ? { id: user.id, username: user.username, role: user.role } : null);

    if (!user) {
      console.log('Пользователь не найден в БД!');
      return res.status(401).json({ error: 'Неверные данные' });
    }

    // Проверяем пароль
    const isValidPassword = user.password.startsWith('$2b$') 
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isValidPassword) {
      console.log('Неверный пароль!');
      return res.status(401).json({ error: 'Неверные данные' });
    }

    req.session.userId = user.id;
    req.session.user = { id: user.id, username: user.username, role: user.role };

    console.log('Сессия установлена:', req.session.user);
    console.log('===================');

    res.json({ user: req.session.user });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
