# FileFlow Hub

REST API for file storage with **local disk** or **S3-compatible storage (MinIO)**. Includes a small browser demo UI, JWT auth with refresh cookies, PostgreSQL, Redis, and Docker Compose.

---

## Quick start (Docker)

```bash
git clone https://github.com/GruantR/fileflow-hub.git
cd fileflow-hub
npm install
cp .env.example .env
docker-compose up -d --build
```

Apply database schema and optional seed (admin user):

```bash
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

> Replace the clone URL with your fork if needed.

### URLs

| What | URL |
|------|-----|
| API | http://localhost:3000 |
| Demo UI (same origin as API) | http://localhost:3000/ |
| Swagger | http://localhost:3000/api-docs |
| Health | http://localhost:3000/api/health |
| MinIO Console | http://localhost:9001 |

On startup the app **creates the MinIO bucket** from `MINIO_BUCKET` if it does not exist (so “Cloud (MinIO)” uploads work after a fresh `docker-compose up`).

### Seed admin (after `db:seed`)

| Field | Value |
|-------|--------|
| Email | `admin@example.com` |
| Password | `admin123` |

Change the password after first login in a real deployment.

### Optional: Live Server (VS Code) for the demo UI

You can open `frontend/index.html` via Live Server (e.g. `http://127.0.0.1:5500/frontend/`). The demo script talks to `http://127.0.0.1:3000/api` when the page is not served from port 3000. Ensure the API is running and CORS allows `http://127.0.0.1:5500` and `http://localhost:5500` (already configured in `src/app.js`).

---

## Local run without Docker (advanced)

1. Install and run PostgreSQL (port in `.env` must match; example uses `5433` if you map Docker Postgres to host).
2. Run Redis and MinIO if you use S3 mode.
3. `cp .env.example .env` and adjust variables.
4. `npm run db:migrate` and `npm run db:seed`
5. `npm run dev`

---

## API overview

### Auth

| Method | Endpoint |
|--------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/refresh |
| POST | /api/auth/logout |

### Files (Bearer access token)

| Method | Endpoint |
|--------|----------|
| POST | /api/files?storage=local \| s3 |
| GET | /api/files |
| GET | /api/files/:uuid |
| GET | /api/files/:uuid/download |
| DELETE | /api/files/:uuid |

---

## Testing

Tests use Jest + Supertest. Load `.env.test` (see `test/__helpers__/setup.js`) and ensure the **test database** exists (e.g. `fileflow_hub_test` on the host/port from `.env.test`).

```bash
npm test
```

---

## Tech stack

- Node.js, Express
- PostgreSQL, Sequelize, sequelize-cli
- JWT, bcrypt, cookie-parser
- Multer, Redis (ioredis), MinIO (AWS SDK v3)
- Docker Compose

---

## Author

**Ruslan Trafimovich** — GitHub: [@GruantR](https://github.com/GruantR)
