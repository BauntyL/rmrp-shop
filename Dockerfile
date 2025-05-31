# Многоэтапная сборка для оптимизации размера образа
FROM node:18-alpine AS builder

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci --verbose

# Копируем исходный код
COPY . .

# Собираем TypeScript проект
RUN npm run build:server

# Собираем клиентскую часть (если client папка существует)
RUN if [ -d "client" ]; then \
      cd client && \
      npm ci && \
      npm run build; \
    fi

# Продакшн этап
FROM node:18-alpine AS production

# Устанавливаем curl для healthcheck
RUN apk add --no-cache curl

# Создаем пользователя без привилегий
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки только продакшн зависимостей
COPY package*.json ./

# Устанавливаем только продакшн зависимости
RUN npm ci --omit=dev --verbose && \
    npm cache clean --force

# Копируем собранное приложение из builder этапа
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./

# Копируем клиентскую сборку если существует
COPY --from=builder --chown=nextjs:nodejs /app/client/dist ./client/dist 2>/dev/null || true

# Копируем другие необходимые файлы
COPY --chown=nextjs:nodejs server ./server

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Изменяем владельца всех файлов
RUN chown -R nextjs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Запускаем приложение
CMD ["npm", "start"]