# Используем официальный Node.js образ
FROM node:18-slim

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY client/package*.json ./client/

# Устанавливаем зависимости
RUN npm ci --only=production --verbose

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение
RUN npm run build

# Очищаем кеш и ненужные файлы
RUN npm cache clean --force && \
    rm -rf client/src client/node_modules/.cache && \
    rm -rf node_modules/.cache

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Создаем пользователя без привилегий
RUN addgroup --gid 1001 --system nodejs && \
    adduser --system --uid 1001 nextjs

# Изменяем владельца файлов
RUN chown -R nextjs:nodejs /app
USER nextjs

# Открываем порт
EXPOSE 3000

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Запускаем приложение
CMD ["npm", "start"]