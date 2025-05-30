import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import compression from 'compression';

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = process.cwd();

// Включаем сжатие для всех ответов
app.use(compression());

// Настройка CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Обслуживание статических файлов из папки dist
app.use(express.static(path.join(rootDir, 'client/dist'), {
  maxAge: '1y',
  etag: true,
}));

// Маршрут для healthcheck (Railway) – возвращает 200 OK
app.get('/api/health', (req, res) => res.status(200).send('ok'));

// Все остальные GET-запросы перенаправляем на index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(rootDir, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 