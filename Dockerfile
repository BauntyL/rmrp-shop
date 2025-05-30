# Используем официальный Node.js образ
FROM node:18-slim

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Копируем все файлы проекта
COPY . .

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps --production

# Создаем необходимые директории
RUN mkdir -p server/scripts

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
