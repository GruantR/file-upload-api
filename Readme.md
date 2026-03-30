# FileFlow Hub

Production-ready file storage API with a built-in demo UI.
Supports **Local disk** and **S3-compatible storage (MinIO)** with a pluggable storage layer.
Built with Express + Sequelize (migrations), JWT auth (access + refresh tokens in HttpOnly cookies),
Redis (rate limiting + caching), Multer upload validation, and Swagger documentation.

---

## Key highlights
- Pluggable storage abstraction (`StorageInterface`) with `LocalStorage` + `S3Storage` drivers
- JWT auth: access token + refresh token rotation, with refresh tokens stored in PostgreSQL and mirrored in Redis
- Security-focused uploads: Multer validation for file types and size limits
- RBAC-ready: `user` / `admin` roles for access control over file operations
- Consistent API errors via a centralized Express error handler
- Demo UI was built with AI assistance; the backend was implemented independently (showcasing practical AI usage).
- Sequelize-driven consistency: migrations + transactional file deletion and cleanup logging
- Redis-backed performance: rate limiting + cached file list queries

## Quick start (Docker)

Prerequisites: Docker Desktop (or Docker Engine) + `docker-compose`.

```bash
git clone https://github.com/GruantR/fileflow-hub.git
cd fileflow-hub
docker-compose up -d --build
```

Apply database schema and optional seed (admin user):

Migrations/seed are executed inside the `app` container:

```bash
docker-compose exec app npm run db:migrate && docker-compose exec app npm run db:seed
```

Wait ~10-20 seconds for the app to be ready, then verify it.

## Configuration notes (Docker-first)
In Docker-first mode all required configuration is provided by `docker-compose.yml` (PostgreSQL/Redis/MinIO endpoints + `SECRET_KEY`).

To run the app locally without Docker, see the section below.

### URLs

| What | URL |
|------|-----|
| API | http://localhost:3000 |
| Demo UI (same origin as API) | http://localhost:3000/ |
| Swagger | http://localhost:3000/api-docs |
| Health | http://localhost:3000/api/health |
| MinIO Console | http://localhost:9001 |

When you upload with `storage=s3`, the app **creates the MinIO bucket** from `MINIO_BUCKET` if it does not exist (so Cloud (MinIO) uploads work even on a fresh `docker-compose up`).

### Health check (JSON)

```bash
curl -sS http://localhost:3000/api/health
```

`curl -sS` — `-s` silent, `-S` показывает ошибки при неуспешном запросе.

Expected output:
```json
{ "status": "OK", "timestamp": "..." }
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

### Core endpoints (main ones)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- Files: `POST /api/files?storage=local|s3`, `GET /api/files`, `GET /api/files/:uuid`, `GET /api/files/:uuid/download`, `DELETE /api/files/:uuid`

---

## Storage modes

Choose storage during upload:
- `storage=local` — file is saved on the server disk (demo UI: **Local**)
- `storage=s3` — file is saved in MinIO (demo UI: **Cloud (MinIO)**; bucket is auto-created on the first upload)

Storage is chosen per upload via the `storage` parameter (not via an environment variable).

To verify bucket auto-creation: remove `my-bucket` in MinIO UI, then upload one file with `storage=s3` — the bucket should re-appear.

---

## Troubleshooting

Start with logs + health:

1. Health:
   - `curl -sS http://localhost:3000/api/health`
2. Backend logs:
   - `docker-compose logs -f app`
3. If DB schema is missing:
   - `docker-compose exec app npm run db:migrate && docker-compose exec app npm run db:seed`

---

## Local run without Docker (optional)
1. Copy config: `cp .env.example .env`
2. Start dependencies: PostgreSQL + Redis (and MinIO if you use `storage=s3`)
3. Apply database schema + seed:
   - `npm run db:migrate`
   - `npm run db:seed`
4. Start the server:
   - `npm run dev`

## Tests (Jest + Supertest)
- Run: `npm test`
- Redis and S3Storage are mocked for deterministic tests
- Tests use `.env.test` and create a clean schema in the test Postgres DB (`sequelize.sync({ force: true })`)
- DB/Redis connections are closed after the test suite finishes

## Author

**Ruslan Trafimovich** — GitHub: [@GruantR](https://github.com/GruantR)
