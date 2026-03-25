# 🚀 File Storage Service

> **Production-ready backend API for scalable file storage with local and S3-compatible support (MinIO)**

---

## 💡 Why This Project Matters

This project demonstrates how to design and build a **real-world file storage backend** similar to services like Google Drive or AWS S3 integrations.

It focuses on production-level concerns:
- scalable architecture
- secure authentication flows
- storage abstraction
- clean and maintainable codebase

---

## ✨ Overview

**File Storage Service** is a REST API that allows users to upload, manage, and retrieve files using either:

- Local file system
- S3-compatible cloud storage (MinIO)

The system is designed with flexibility in mind, allowing storage strategy to be switched dynamically via configuration.

---

## 🧠 Architecture Highlights

- Clear separation of concerns (Controller → Service → Storage)
- Storage abstraction via interface pattern
- Stateless authentication using JWT
- Refresh token rotation for session security
- Database consistency using transactions
- Environment-based configuration

---

## 🔐 Security Highlights

- HttpOnly cookies (protection against XSS)
- Refresh token rotation (prevents session hijacking)
- Short-lived access tokens
- Input validation (files, UUIDs)
- Centralized error handling (no sensitive data leaks)

---

## 🧩 Key Features

### 📦 Storage
- Pluggable storage system (`StorageInterface`)
- Local storage driver
- S3-compatible driver (MinIO)
- Runtime storage switching via `.env`
- Per-file storage tracking

### 🔐 Authentication
- JWT authentication (access + refresh tokens)
- Secure cookie-based refresh tokens
- Automatic token renewal

### 📁 File Management
- File upload with validation
- User-specific file ownership
- Soft delete support
- Pagination
- File preview and download modes

### ⚙️ Backend
- Centralized error handling
- Structured logging (planned)
- Sequelize ORM + migrations
- UUID validation
- CORS support

---

## ⚡ Quick Start

```bash
git clone https://github.com/yourusername/file-storage-service.git
cd file-storage-service
npm install
cp .env.example .env
docker-compose up -d
```

Run migrations:
```bash
docker-compose exec app npx sequelize-cli db:migrate
```

Seed database:
```bash
docker-compose exec app npx sequelize-cli db:seed:all
```

---

## 🌐 Services

| Service | URL |
|--------|-----|
| API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api-docs |
| MinIO Console | http://localhost:9001 |

---

## 🔌 API Overview

### Auth
| Method | Endpoint |
|------|--------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/refresh |
| POST | /api/auth/logout |

### Files
| Method | Endpoint |
|------|--------|
| POST | /api/files |
| GET | /api/files |
| GET | /api/files/:uuid |
| GET | /api/files/:uuid/download |
| DELETE | /api/files/:uuid |

---

## 📚 API Documentation

Interactive API documentation is available via Swagger:

- Full endpoint descriptions
- Request/response schemas
- Authentication flow examples
- Error handling format

---

## 🧪 Testing (Planned)

The project will include:

- Unit tests (Jest)
- Integration tests (Supertest)
- Authentication flow testing
- File upload testing

---

## 🛠 Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize
- JWT + bcrypt
- Multer
- MinIO (S3)
- Redis
- Docker + Docker Compose

---

## 🧑‍💻 What This Project Demonstrates

- Backend architecture design
- Secure authentication systems
- File storage abstraction
- Working with S3-compatible services
- REST API design best practices
- Dockerized development workflow

---

## 🚧 Roadmap

- Role-based access control
- Multi-file upload
- Upload progress tracking (WebSockets)
- Full test coverage
- Production logging system
- Cloud deployment

---

## 👨‍💻 Author

**Ruslan Trafimovich**  
GitHub: @GruantR

---

## ⭐ Final Note

This project is designed as a portfolio-ready backend system that reflects real-world engineering practices.

It can serve as a foundation for scalable file storage services or be extended into a full cloud storage platform.

