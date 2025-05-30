import express from 'express';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Добавить реальную логику аутентификации
    // Пока возвращаем тестовый ответ
    res.json({
      success: true,
      token: 'test-token',
      user: {
        id: 1,
        email: email,
        name: 'Test User'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при попытке входа' 
    });
  }
});

export default router; 