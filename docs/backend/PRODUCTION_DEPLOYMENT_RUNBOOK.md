# Production Deployment Runbook — USAM Learning Worlds

The **exact ordered steps** to take the app from a fresh checkout to a running
production deployment. This is the operational companion to
`DEPLOYMENT_GUIDE.md` (which covers AWS infrastructure/architecture). Run the
steps top to bottom.

> Conventions: backend runs with global prefix `/api` on port `3001` (override
> with `PORT`); health check is `GET /api/health`. The production frontend is
> `frontend/` (see `docs/architecture/FRONTEND_CANONICAL.md`).

---

## 0. Prerequisites (one-time)

- Node.js 22.x, npm
- PostgreSQL 16 with the `vector` (pgvector) extension available
- Redis (for BullMQ queues + throttler store)
- (Optional) Voice sidecars: ASR (faster-whisper) + TTS (Piper) — see
  `docker-compose.sidecars.yml`
- (Optional) An OTLP-compatible tracing backend if `OTEL_ENABLED=true`

---

## 1. Backend — install & generate

```powershell
cd backend
npm ci                      # clean, lockfile-exact install
npx prisma generate         # generate the Prisma client
```

## 2. Backend — environment

Copy `.env.example` to `.env` and set real values. Required:

```
DATABASE_URL=postgresql://USER:PASS@HOST:5432/usam?schema=public
JWT_ACCESS_SECRET=<strong-random>
JWT_REFRESH_SECRET=<strong-random-different>
REDIS_HOST=<redis-host>
REDIS_PORT=6379
NODE_ENV=production
PORT=3001
```

Feature/integration env (set the ones you use):

```
# Credentials (Open Badges) — issuer identity in every credential
CREDENTIAL_ISSUER_ID=https://yourdomain.com/issuer
CREDENTIAL_ISSUER_NAME=USAM Learning Worlds
CREDENTIAL_BASE_URL=https://yourdomain.com/credentials

# Voice sidecars
ASR_SIDECAR_URL=http://127.0.0.1:8100
TTS_SIDECAR_URL=http://127.0.0.1:8200

# Observability (opt-in)
OTEL_ENABLED=false
OTEL_SERVICE_NAME=usam-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

## 3. Backend — database schema

`schema.prisma` is the source of truth. Apply it to the production DB:

```powershell
# Enable pgvector once (needs a superuser or a role with CREATE privilege):
#   psql "$env:DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"

npx prisma db push          # sync schema.prisma -> database
```

Then apply the raw SQL migrations that manage things Prisma doesn't model
(pgvector column/index, seed data). These are idempotent:

```powershell
psql "$env:DATABASE_URL" -f prisma/migrations/20260910_add_fsrs_flashcard_state.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260913_add_concept_embeddings_pgvector.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260914_add_credentials_open_badges.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260916_add_content_provenance.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260916_add_legal_compliance.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260916_add_entitlements.sql
```

Verify no drift:

```powershell
npm run check:migrations
```

## 4. Backend — seed baseline data (first deploy only)

```powershell
npm run prisma:seed
```

## 5. Backend — enable semantic search (RAG)

Populate concept embeddings so pgvector retrieval is active (falls back to
full-text until this runs):

```powershell
npm run embeddings:backfill
```

## 6. Backend — build & run

```powershell
npm run build               # nest build -> dist/src
npm run start:prod          # node -r tracing.js dist/src/main
```

Verify:

```powershell
curl http://localhost:3001/api/health   # expect {"status":"ok","database":"connected"}
```

## 7. Frontend — install, configure, build

```powershell
cd ../frontend
npm ci
```

Set `frontend/.env` (points the SPA at the backend):

```
VITE_API_URL=https://api.yourdomain.com/api
```

Build:

```powershell
npm run build               # tsc && vite build -> frontend/dist
```

Serve `frontend/dist` behind your CDN / static host (or `npm run preview` to
smoke-test locally). Do NOT deploy the repository-root `src/` app — it is the
Lovable scaffold, not production (see `FRONTEND_CANONICAL.md`).

## 8. (Optional) Voice sidecars

```powershell
docker compose -f docker-compose.sidecars.yml up -d
```

Then benchmark Egyptian-Arabic accuracy before enabling voice for Arabic
learners (requires a real audio+transcript manifest):

```powershell
cd backend
npm run voice:benchmark -- path/to/manifest.json
```

---

## 9. Post-deploy verification checklist

- [ ] `GET /api/health` → 200, `database: connected`
- [ ] Register + login a test account; confirm `/api/auth/me` works
- [ ] `GET /api/missions` (authed) → not 500
- [ ] `GET /api/entitlements/plans` → includes `FREE`
- [ ] `GET /api/credentials/:uid` for unknown id → 404 (not 500)
- [ ] Frontend loads and calls the API (check the network tab / a real page)
- [ ] If tracing enabled: spans arriving at the OTLP backend
- [ ] Queues processing (Redis reachable, mastery recalculation runs)

## 10. Rollback

- App: redeploy the previous build artifact / previous commit.
- DB: `prisma db push` + the raw migrations are additive and idempotent; no
  destructive change is introduced by this release, so a code rollback is safe
  without a schema rollback.

---

## Blockers to a fully-live launch (must be closed outside the codebase)

1. **Legal sign-off** — fill in the counsel-owned values in
   `docs/legal/JURISDICTION_MATRIX.md` (consent verification methods, policy
   text/versions, EU age thresholds, retention maximums) before collecting real
   children's data.
2. **Runtime QA** — live device/responsive testing, real API/AI/voice latency,
   and assistive-tech accessibility testing must be done on running
   infrastructure (not possible from source alone).
3. **Root scaffold removal** — only if/when the project is disconnected from
   Lovable.
