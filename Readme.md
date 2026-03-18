# FileFlow Hub

> Гибридное файловое хранилище с поддержкой локального диска и S3-совместимого облака (MinIO)

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-orange)](https://sequelize.org)
[![JWT](https://img.shields.io/badge/JWT-auth-yellow)](https://jwt.io)
[![MinIO](https://img.shields.io/badge/MinIO-S3--compatible-red)](https://min.io)

## О проекте

**FileFlow Hub** — это REST API для загрузки, хранения и управления файлами с поддержкой **двух типов хранилищ**:
- **локальная файловая система**
- **S3-совместимое облако (MinIO)**

Проект показывает хорошие практики backend-разработки: абстракцию хранилищ, JWT-аутентификацию с refresh-токенами, транзакции, пагинацию, централизованную обработку ошибок и контейнеризацию.

---

## Возможности

### Хранилище
- Абстракция через `StorageInterface`
- Локальное хранилище `LocalStorage`
- S3-совместимое хранилище `S3Storage`
- Переключение драйвера через `.env`
- Поле `storageType` в БД для каждого файла

### Аутентификация и безопасность
- Регистрация и вход по JWT
- Refresh-токены с ротацией
- `HttpOnly` cookies
- Автообновление access-токена на клиенте
- Разные сроки жизни токенов
- Транзакции Sequelize при удалении файлов

### Работа с файлами
- Загрузка через Multer
- Валидация типа, размера и имени файла
- Привязка файлов к пользователю
- Мягкое удаление (`paranoid: true`)
- Пагинация списка файлов
- Просмотр (`inline`) и скачивание (`attachment`)

### Дополнительно
- Централизованная обработка ошибок
- Логирование для dev/prod
- Валидация UUID
- Миграции Sequelize
- Поддержка CORS
- Демо-клиент на HTML + JS

---

## Архитектура проекта

```text
src/
├── config/                # Конфигурации БД и хранилищ
├── controllers/           # Обработчики HTTP-запросов
├── middleware/            # JWT, обработка ошибок и др.
├── models/                # Sequelize-модели
├── routes/                # API-маршруты
├── services/              # Бизнес-логика
├── storage/
│   ├── interfaces/        # StorageInterface
│   ├── drivers/           # LocalStorage, S3Storage
│   └── index.js           # Фабрика драйверов
└── utils/                 # Логгер, валидация, кастомные ошибки
```

---

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/fileflow-hub.git
cd fileflow-hub
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка окружения

Создайте `.env` из шаблона:

```bash
cp .env.example .env
```

Пример конфигурации:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_NAME=fileflow_hub
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Auth
SECRET_KEY=your_super_secret_key_change_me

# Storage
STORAGE_DRIVER=local
# или s3 для MinIO

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=my-bucket
```

### 4. Запуск PostgreSQL и MinIO через Docker

#### PostgreSQL

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

#### MinIO

```bash
docker run -d --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

### 5. Применение миграций

```bash
npx sequelize-cli db:migrate
```

### 6. Запуск сервера

```bash
npm start
```

Сервер будет доступен по адресу:

```text
http://localhost:3000
```

### 7. Запуск demo frontend

Откройте файл `frontend/index.html` в браузере или через Live Server.

---

## API Endpoints

### Аутентификация

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/auth/register` | Регистрация |
| `POST` | `/api/auth/login` | Вход и установка `HttpOnly` cookie |
| `POST` | `/api/auth/refresh` | Обновление access-токена |
| `POST` | `/api/auth/logout` | Выход и удаление cookie |

### Файлы

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/files?storage=local/s3` | Загрузка файла |
| `GET` | `/api/files` | Список файлов с пагинацией |
| `GET` | `/api/files/:uuid` | Просмотр файла |
| `GET` | `/api/files/:uuid/download` | Скачивание файла |
| `DELETE` | `/api/files/:uuid` | Удаление файла |

---

## Стек технологий

- **Node.js + Express** — сервер
- **PostgreSQL + Sequelize** — база данных
- **JWT + bcrypt** — аутентификация
- **Multer** — загрузка файлов
- **MinIO** — S3-совместимое хранилище
- **Docker** — контейнеризация сервисов
- **Sequelize CLI** — миграции

---

## Ключевые решения

### Абстракция хранилища

```js
// storage/index.js
const storage = getStorageByType(file.storageType);
await storage.save(file, savedFile);
```

### Безопасные refresh-токены

```js
res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
```

### Централизованная обработка ошибок

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Файл не найден",
    "type": "NotFoundError"
  }
}
```

### Автообновление токена на клиенте

```js
if (response.status === 401) {
  const newToken = await refreshToken();
  // повтор запроса с новым токеном
}
```

---

## Что можно улучшить

- Роли пользователей (`admin/user`)
- Разграничение доступа к файлам
- Загрузка нескольких файлов одновременно
- WebSocket для прогресса загрузки
- Тесты на `Jest` + `Supertest`
- Swagger / OpenAPI документация
- Деплой в облако

---

## Автор

**Ruslan Trafimovich**

GitHub: `@GruantR`

Проект создан в учебных целях для демонстрации навыков backend-разработки.

