# Используем официальный образ Node.js как базовый
FROM node:latest

# Устанавливаем рабочую директорию в контейнере
WORKDIR /usr/src/server

# Копируем файлы package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы приложения в контейнер
COPY . .

# Определяем команду для запуска приложения
CMD ["node", "index.js"]