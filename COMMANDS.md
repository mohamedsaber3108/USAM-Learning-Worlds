# USAM Learning Worlds — Command Reference

Copy-paste commands to update, build, run, test, and deploy the **backend** and
the **production frontend** (`frontend/`). Commands are written for PowerShell
on Windows; on macOS/Linux replace `$env:X` with `X=...` and use `/`.

> The backend serves everything under `/api` on port `3001`. The production
> frontend is `frontend/` (the repo-root `src/` is the Lovable scaffold — do
> not build/deploy it).

---

## 0. Quick reference — update EVERYTHING (backend + frontend)

```powershell
# From repo root. Updates deps, DB schema, embeddings, and builds both apps.

# --- Backend ---
cd backend
npm ci
npx prisma generate
npx prisma db push
npm run embeddings:backfill
npm run build

# --- Frontend ---
cd ../frontend
npm ci
npm run build
```

---

## 1. Backend

### Install / update dependencies
```powershell
cd backend
npm ci                 # exact install from lockfile (CI / deploy)
# or:
npm install            # update to satisfy package.json ranges
```

### Database (Prisma)
```powershell
npx prisma generate            # regenerate client after schema changes
npx prisma db push             # apply schema.prisma to the DB (no migration history)
npm run prisma:migrate         # create+apply a dev migration (local dev)
npm run check:migrations       # verify DB matches expected migrations
npm run prisma:studio          # open Prisma Studio (DB GUI)
npm run prisma:seed            # seed baseline curriculum/data
```

### Raw SQL migrations (pgvector, seeds — idempotent)
```powershell
psql "$env:DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql "$env:DATABASE_URL" -f prisma/migrations/20260910_add_fsrs_flashcard_state.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260913_add_concept_embeddings_pgvector.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260914_add_credentials_open_badges.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260916_add_content_provenance.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260916_add_legal_compliance.sql
psql "$env:DATABASE_URL" -f prisma/migrations/20260916_add_entitlements.sql
```

### Feature data jobs
```powershell
npm run embeddings:backfill          # populate concept embeddings (enables semantic RAG)
npm run voice:benchmark -- <manifest.json>   # EG-Arabic STT WER benchmark
```

### Build / run
```powershell
npm run build          # nest build -> dist/src
npm run start:dev      # watch-mode dev server (http://localhost:3001)
npm run start:prod     # production run (with OpenTelemetry preload)
```

### Test / quality
```powershell
npm test                                             # unit tests
npm run test:cov                                     # unit tests + coverage
npm test -- --config test/smoke/jest-smoke.json      # smoke tests (needs a real Postgres)
npm test -- --config test/red-team/jest-red-team.json # safety red-team tests
$env:ESLINT_USE_FLAT_CONFIG='false'; npm run lint    # lint (Windows-safe)
npm run format                                       # prettier write
```

### Health check
```powershell
curl http://localhost:3001/api/health
```

---

## 2. Frontend (production app — `frontend/`)

### Install / update
```powershell
cd frontend
npm ci
# or: npm install
```

### Configure
```powershell
# frontend/.env
# VITE_API_URL=https://api.yourdomain.com/api
```

### Build / run
```powershell
npm run dev            # Vite dev server
npm run build          # tsc && vite build -> frontend/dist
npm run preview        # serve the production build locally
```

### Test / quality
```powershell
npm test               # vitest run
npm run test:watch     # vitest watch
npm run lint           # eslint
```

---

## 3. Voice sidecars (optional)
```powershell
docker compose -f docker-compose.sidecars.yml up -d
docker compose -f docker-compose.sidecars.yml logs -f
docker compose -f docker-compose.sidecars.yml down
```

---

## 4. Observability (OpenTelemetry — opt-in)
```powershell
# Enable before start:prod
$env:OTEL_ENABLED='true'
$env:OTEL_EXPORTER_OTLP_ENDPOINT='http://your-collector:4318/v1/traces'
npm run start:prod
```

---

## 5. Git (this repo)
```powershell
git status
git add <specific paths>          # prefer specific paths over `git add .`
git commit -m "message"
git push -u origin <branch>       # push (only when you intend to)
```

> This project syncs to Lovable. Do NOT force-push, rebase, or amend commits
> already pushed to the connected branch (see AGENTS.md).

---

## 6. Feature/page map (what each area is)

Backend engines live under `backend/src/modules/*` and are all registered in
`backend/src/app.module.ts`. Frontend pages/features live under
`frontend/src/features/*`. Highlights added/verified in the readiness pass:

| Area | Backend module | Frontend feature |
| --- | --- | --- |
| Spaced review (FSRS) | `flashcards` | `learning` |
| AI RAG + model router | `ai` (`learner-context`, `ai-provider`) | `characters`, `english`, `coding` |
| Coding sandbox (client-exec) | `coding-sandbox` | `coding` (Pyodide, Sandpack, Blockly) |
| Credentials (Open Badges) | `credentials` | `gamification` / profile |
| Voice (STT/TTS + fallback) | `voice` | `voice` |
| Content provenance | `content-provenance` | admin |
| Consent / GDPR rights | `legal` | `parents` |
| Entitlements / plans | `entitlements` | pricing / account |
| Observability | `observability/tracing.ts` | n/a |
| Missions / mastery / projects | `missions`, `mastery`, `projects` | `missions`, `projects`, `dashboard` |
```
