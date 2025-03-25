FROM node:18-alpine

WORKDIR /app

# Копируем только файлы, необходимые для сервера
COPY server.js ./
COPY prompt.js ./
COPY server.package.json ./package.json
COPY public ./public

# Устанавливаем зависимости
RUN npm install

# Сервер будет работать на порту 3008
EXPOSE 3008

# Запуск сервера
CMD ["node", "server.js"]

