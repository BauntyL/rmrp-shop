# Используем официальный Node.js образ
FROM node:18-slim

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем все файлы проекта
COPY . .

# Устанавливаем все зависимости (включая devDependencies для сборки)
RUN npm install --verbose && \
    npm ls

# Собираем приложение
RUN npm run build

# Удаляем devDependencies и исходный код
RUN npm prune --production && \
    rm -rf client/src server/src && \
    rm -rf node_modules/.cache

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
