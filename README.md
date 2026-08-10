# aiseekhegaindia-backend

Express + PostgreSQL API for **AISeekhegaIndia** (phased plan from `architecture/backend-db-plan.html`).

## Stack

- Node.js 20+
- Express + TypeScript
- Prisma + PostgreSQL 16
- Zod validation
- JWT access + refresh tokens
- Helmet, CORS, rate-limited auth

## Quick start

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API base: `http://localhost:4000/api/v1`

Seeded admin: `admin@aiseekhegaindia.local` / `Admin123!`

## Phases implemented

| Phase | Routes |
|-------|--------|
| P0 | `GET /health`, `GET /ready` |
| P1 | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `GET/PATCH /me` |
| P2 | `GET/PUT/DELETE /progress/:docSlug`, bookmarks |
| P3 | fellowship cohorts + applications |
| P4 | ` /admin/*` + audit log on status changes |

## Doc slug convention

Store frontend-relative ids without `/docs/`, URL-encoded in path params:

`PUT /api/v1/progress/machine-learning%2Fintro`

## Related

- Frontend: https://github.com/yashvant-dgliger/aiseekhegaindia-frontend
