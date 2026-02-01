# Проект загрузки файлов

## Описание
REST API для загрузки и управления файлами с использованием:
- Node.js + Express
- PostgreSQL + Sequelize (с миграциями)
- Multer для обработки файлов
- JWT аутентификация (если планируется)

## Установка

1. Клонировать репозиторий:
git clone [ссылка на репозиторий]

2. Установить зависимости:
npm install

3. Настроить переменные окружения:
cp .env.example .env
# отредактировать .env файл

4. Запустить миграции:
npx sequelize-cli db:migrate

5. Запустить сервер:
npm start

API Endpoints
POST /upload - загрузка файла
GET /files/:id - информация о файле
GET /files/:id/download - скачать файл

