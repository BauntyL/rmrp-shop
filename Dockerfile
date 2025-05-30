# Используем официальный Node.js образ
FROM node:18-slim

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для сборки)
RUN npm install

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Удаляем devDependencies
RUN npm prune --production

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
