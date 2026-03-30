# FileFlow Hub

REST API for file storage with **local disk** or **S3-compatible storage (MinIO)**. Includes a small browser demo UI, JWT auth with refresh cookies, PostgreSQL, Redis, and Docker Compose.

---

## Quick start (Docker)

Prerequisites: Docker Desktop (or Docker Engine) + `docker-compose`.

```bash
git clone https://github.com/GruantR/fileflow-hub.git
cd fileflow-hub
cp .env.example .env
docker-compose up -d --build
```

Apply database schema and optional seed (admin user):

```bash
docker-compose exec app npm run db:migrate && docker-compose exec app npm run db:seed
```

Wait ~10-20 seconds for the app to be ready, then verify it:

### Environment variables (Docker-first)

Copy `cp .env.example .env` before starting. In Docker mode defaults are also set in `docker-compose.yml`, but `.env` is used by the app (and is required for “Local run without Docker”).

| Variable | Needed for |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `DB_DIALECT` | DB dialect (usually `postgres`) |
| `REDIS_HOST`, `REDIS_PORT` | Redis caching / rate limiting |
| `SECRET_KEY` | JWT signing key |
| `STORAGE_DRIVER` | `local` or `s3` |
| `UPLOADS_PATH` | Where uploaded files are stored on disk |
| `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` | Required only when `STORAGE_DRIVER=s3` (Cloud / MinIO uploads) |

### URLs

| What | URL |
|------|-----|
| API | http://localhost:3000 |
| Demo UI (same origin as API) | http://localhost:3000/ |
| Swagger | http://localhost:3000/api-docs |
| Health | http://localhost:3000/api/health |
| MinIO Console | http://localhost:9001 |

On startup the app **creates the MinIO bucket** from `MINIO_BUCKET` if it does not exist (so “Cloud (MinIO)” uploads work after a fresh `docker-compose up`).

### Health check (JSON)

```bash
curl -sS http://localhost:3000/api/health
```

`curl` flags:
- `-s` — silent (не печатает “progress”)
- `-S` — но выводит ошибки, если запрос неуспешный

Example response:

```json
{
  "status": "OK",
  "timestamp": "2026-03-30T10:00:00.000Z"
}
```

If something is down, response can include diagnostics:

```json
{
  "status": "ERROR",
  "timestamp": "2026-03-30T10:00:00.000Z",
  "details": {
    "db": "..."
  }
}
```

### Seed admin (after `db:seed`)

| Field | Value |
|-------|--------|
| Email | `admin@example.com` |
| Password | `admin123` |

Change the password after first login in a real deployment.

### Try the demo UI

1. Open `http://localhost:3000/`
2. Log in: `admin@example.com` / `admin123`
3. Upload a file using either **Local** or **Cloud (MinIO)**, then use **View/Download/Delete**

---

## Storage modes

The demo UI and API let you choose where the file is stored:

1. **Local storage**
   - Use `storage=local` on `POST /api/files?...` (demo UI: radio button **Local**).
   - Files are saved to the server disk.

2. **Cloud (MinIO / S3-compatible)**
   - Use `storage=s3` on `POST /api/files?...` (demo UI: radio button **Cloud (MinIO)**).
   - Required env (provided in `docker-compose.yml`): `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`.
   - On server startup the app ensures `MINIO_BUCKET` exists, so a fresh `docker-compose up` should work without manual bucket creation.

### Optional: Live Server (VS Code) for the demo UI

Recommended: open the demo UI at `http://localhost:3000/` (served by the backend, same origin as the API).

Optional: you can still open `frontend/index.html` via Live Server on `http://127.0.0.1:5500/frontend/` (CORS allows both `127.0.0.1:5500` and `localhost:5500`).

---

## Troubleshooting

Start with logs + health:

1. Health (returns JSON):
   - `curl -sS http://localhost:3000/api/health`
2. Backend logs:
   - `docker-compose logs -f app`
3. If tables are missing (upload/auth errors):
   - `docker-compose exec app npm run db:migrate && docker-compose exec app npm run db:seed`

Common fixes:

- If the demo UI doesn't work, open `http://localhost:3000/` (it is served by the backend, so requests to `/api` are same-origin).
- If uploads in **Cloud (MinIO)** fail, verify MinIO is up and `MINIO_BUCKET` matches the bucket in MinIO console (`http://localhost:9001`).

---

## 30-second smoke test (Docker)

Use the seeded admin user by default:
`admin@example.com` / `admin123`

1. Health:
```bash
curl -sS http://localhost:3000/api/health
```

2. Login (copy `accessToken` from the response):
```bash
curl -sS -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

3. Protected call (files list):
```bash
ACCESS_TOKEN="PASTE_ACCESS_TOKEN_HERE"
curl -sS "http://localhost:3000/api/files?limit=10&offset=0" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Local run without Docker (advanced)

1. Install PostgreSQL (host/port from `.env`) and Redis + MinIO (if you want `storage=s3`).
2. `cp .env.example .env` and adjust variables.
3. `npm run db:migrate && npm run db:seed`
4. `npm run dev`

---

## API overview

### Auth

| Method | Endpoint |
|--------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/refresh |
| POST | /api/auth/logout |

Protected endpoints expect:
`Authorization: Bearer <accessToken>`

### Files (Bearer access token)

| Method | Endpoint |
|--------|----------|
| POST | /api/files?storage=local \| s3 |
| GET | /api/files |
| GET | /api/files/:uuid |
| GET | /api/files/:uuid/download |
| DELETE | /api/files/:uuid |

Upload expects `multipart/form-data` with a form field named `file`.

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

---

No Docker available? See `Local run without Docker (advanced)` section above.
