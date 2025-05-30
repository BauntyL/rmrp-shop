# Используем официальный Node.js образ
FROM node:18-slim

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Создаем необходимые директории и файлы
COPY server/scripts/init-db.js ./server/scripts/
COPY server/logger.js ./server/
COPY server/db.js ./server/

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
