# 43 — PRODUCTION ARCHITECTURE

> How the ONE app ships. Grounded in verified reality: root `src/` builds via
> Lovable/TanStack to `.output` (Nitro/Cloudflare); backend is NestJS; prod is
> served at `kids.usamif.com`.

Date: 2026-09-30

---

## 1. Topology

- **Frontend:** root `src/` → `vite build` → `.output` (Nitro, Cloudflare
  target per `.output/server/wrangler.json`). Lovable-connected (`.lovable/`).
- **Backend:** NestJS (`/api`) + PostgreSQL + Redis (Bull) + voice sidecars
  (Whisper STT, Piper TTS). Server deployment (Ubuntu per prior ops).
- **Same-origin `/api`** so the frontend uses a relative base.

## 2. Build & deploy

- Frontend: `npm run build` (root). Lovable sync on push to connected branch
  (AGENTS.md) — keep branch working; no history rewrite.
- Backend: migrations applied via the project's manual psql convention
  (`check-migrations-applied.ts`); seed via the corrected default seeder.
- Voice sidecars run as services behind the provider interface.

## 3. Config & secrets

- Prices in DB (`Plan.priceCents`) — not code (11 §5).
- Providers (payment, voice) behind interfaces — swappable by config.
- Feature flags (`feature-flags`) gate risky rollouts; experiments for A/B.
- Secrets via env (never committed); `.env.example` tracked.

## 4. Observability / cost

- `AIUsageLog` + per-learner+plan attribution for AI/voice cost (48 §3).
- `LearningEvent` telemetry → analytics. Audit log for admin actions.
- Usage meters enforce entitlement limits server-side (10 §6).

## 5. Safety in production

- Moderation on every AI/voice turn; quarantine flow; safety escalations.
- COPPA/GDPR consent + data-rights endpoints live.
- Rate limiting verified (35 §5). Memory-governance authz fixed before exposure.

## 6. Cutover (controlled, reversible)

Stage the rebuilt ONE app → observed QA (46) → cut over at the connected branch
→ verify live → delete legacy trees (41). Reversible via git until legacy deleted.
Production stays on the current build until the owner approves the flip. Real
payment gateway enabled only after owner price approval (11 §6).

## 7. Open production dependencies (external/owner)

Real payment gateway creds; voice provider prod creds (if cloud chosen); legal/
privacy copy sign-off; final price values. All flagged, none fabricated.
