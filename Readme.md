# FileFlow Hub — гибридное файловое хранилище

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-orange)](https://sequelize.org)
[![JWT](https://img.shields.io/badge/JWT-auth-yellow)](https://jwt.io)
[![MinIO](https://img.shields.io/badge/MinIO-S3--compatible-red)](https://min.io)

## 📋 Описание

REST API для загрузки и управления файлами с поддержкой **двух типов хранилищ**: локальная файловая система и S3-совместимое облако (MinIO). Проект демонстрирует современные практики разработки бэкенда: абстракцию хранилищ, JWT-аутентификацию с ротацией refresh-токенов, транзакции, пагинацию, централизованную обработку ошибок и контейнеризацию.

---

## 🏗️ Архитектура
src/
├── config/ # Конфигурации (БД, хранилища)
├── controllers/ # Обработчики запросов
├── middleware/ # JWT-аутентификация, обработка ошибок
├── models/ # Sequelize модели
├── routes/ # Маршруты API
├── services/ # Бизнес-логика
├── storage/ # Абстракция хранилищ
│ ├── interfaces/ # StorageInterface
│ ├── drivers/ # LocalStorage, S3Storage
│ └── index.js # Фабрика драйверов
└── utils/ # Логгер, валидация, кастомные ошибки


---

## ✨ Основные возможности

### 📦 Хранилище
- ✅ **Абстракция через `StorageInterface`** — легко добавить новый тип хранилища
- ✅ **Локальное хранилище** (`LocalStorage`) — файлы на диске
- ✅ **S3-совместимое хранилище** (`S3Storage`) — MinIO (локальное облако)
- ✅ **Фабрика драйверов** — переключение между хранилищами через `.env`
- ✅ **Поле `storageType` в БД** — каждый файл знает, где лежит

### 🔐 Аутентификация и безопасность
- ✅ **Регистрация и вход** (JWT)
- ✅ **Refresh-токены с ротацией** — старый токен удаляется при использовании
- ✅ **HttpOnly cookies** — защита от XSS
- ✅ **Автоматическое обновление access-токена** на клиенте
- ✅ **Разные сроки жизни**: access — 1 мин (для теста), refresh — 30 дней
- ✅ **Sequelize-транзакции** при удалении файлов

### 📁 Файлы
- ✅ **Загрузка через Multer** (валидация типа, размера, очистка имени)
- ✅ **Привязка файлов к пользователю**
- ✅ **Мягкое удаление** (`paranoid: true`)
- ✅ **Пагинация** списка файлов
- ✅ **Два режима отдачи**: просмотр (`inline`) и скачивание (`attachment`)

### 🧩 Дополнительно
- ✅ **Централизованная обработка ошибок** с кастомными классами
- ✅ **Логирование** (с разделением dev/prod)
- ✅ **Валидация UUID**
- ✅ **Миграции Sequelize**
- ✅ **Поддержка CORS**
- ✅ **Готовый фронтенд-клиент** (HTML+JS) для демонстрации

---

## 🚀 Быстрый старт

## 1. Клонирование
git clone https://github.com/yourusername/fileflow-hub.git
cd fileflow-hub

## 2. Установка зависимостей
npm install

## 3. Настройка окружения
Создайте файл .env из примера:
cp .env.example .env
Отредактируйте .env под ваши параметры:

### Server
PORT=3000
NODE_ENV=development

### Database
DB_NAME=fileflow_hub
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

### Auth
SECRET_KEY=your_super_secret_key_change_me

### Storage
STORAGE_DRIVER=local  # или 's3' для MinIO

### MinIO (если используете S3)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=my-bucket

## 4. Запуск PostgreSQL и MinIO (через Docker)
### PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

### MinIO (для S3-режима)
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

## 5. Миграции БД
npx sequelize-cli db:migrate

## 6. Запуск сервера
npm start
Сервер будет доступен на http://localhost:3000.

## 7. Запуск фронтенд-демо
Откройте файл frontend/index.html в браузере (или через Live Server).


📚 API Endpoints
Аутентификация
Метод	Путь	Описание
POST	/api/auth/register	Регистрация
POST	/api/auth/login	Вход (устанавливает httpOnly cookie)
POST	/api/auth/refresh	Обновление access-токена
POST	/api/auth/logout	Выход (удаляет cookie)
Файлы
Метод	Путь	Описание
POST	/api/files?storage=local/s3	Загрузка файла
GET	/api/files	Список файлов (с пагинацией)
GET	/api/files/:uuid	Просмотр файла
GET	/api/files/:uuid/download	Скачивание файла
DELETE	/api/files/:uuid	Удаление файла
🛠️ Технологии
Node.js + Express — сервер

PostgreSQL + Sequelize — база данных

JWT + bcrypt — аутентификация

Multer — загрузка файлов

MinIO — S3-совместимое хранилище

Docker — контейнеризация MinIO и PostgreSQL

Sequelize CLI — миграции

🧠 Ключевые решения в коде
🔄 Абстракция хранилища
// storage/index.js — фабрика драйверов
const storage = getStorageByType(file.storageType);
await storage.save(file, savedFile);

🔐 Безопасные refresh-токены
// httpOnly cookie + ротация
res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
});

🧩 Централизованная обработка ошибок
// errorHandler.js — единый формат ответа
{
    success: false,
    error: {
        code: 404,
        message: "Файл не найден",
        type: "NotFoundError"
    }
}

🔁 Автоматическое обновление токена на клиенте
// frontend/script.js — fetchWithAuth
if (response.status === 401) {
    const newToken = await refreshToken();
    // повтор запроса с новым токеном
}

📦 Возможные улучшения
Роли пользователей (admin/user)

Ограничение доступа к файлам (владелец/админ)

Загрузка нескольких файлов одновременно

WebSocket для прогресса загрузки

Тесты (Jest + Supertest)

Swagger-документация

Деплой на облачный хостинг

👨‍💻 Автор
Ruslan Trafimovich
GitHub: @GruantR

Проект создан в учебных целях для демонстрации навыков бэкенд-разработки.