import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import compression from 'compression';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Включаем сжатие для всех ответов
app.use(compression());

// Настройка CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Обслуживание статических файлов из папки dist
app.use(express.static(path.join(__dirname, '../../client/dist'), {
  maxAge: '1y',
  etag: true,
}));

// Все остальные GET-запросы перенаправляем на index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 