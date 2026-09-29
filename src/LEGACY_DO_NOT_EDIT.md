# ⛔ LEGACY / NON-DEPLOYED FRONTEND — DO NOT DO PRODUCT WORK HERE

This directory (`src/`, package `tanstack_start_ts`) is the **Lovable scaffold**.
It is **NOT built and NOT deployed**.

- The **canonical, deployed** frontend is **`frontend/`**
  (package `usam-learning-worlds-frontend`). `scripts/deploy.sh` and
  `.github/workflows/ci.yml` build `frontend/` only.
- See `docs/architecture/FRONTEND_CANONICAL.md` and
  `plans-local/77_LEGACY_FRONTEND_MIGRATION_LEDGER.md`.

**All product UI work — routes, components, tests, API integrations,
design-system — goes in `frontend/src/`.** Anything implemented here is dead on
arrival (it does not ship).

This tree is scheduled for removal after an owner confirms the Lovable-sync /
project-history impact is acceptable (it is Lovable-managed). Until then it is
frozen for product development.
