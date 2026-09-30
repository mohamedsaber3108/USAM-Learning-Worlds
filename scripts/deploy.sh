#!/usr/bin/env bash
# =============================================================================
# USAM Kids — authoritative deployment pipeline (fail-fast, reproducible)
#
# Fixes the class of failure where Phase B added npm deps but the deploy only
# did `git pull && npm run build` (no dependency sync), so the server built
# against a stale node_modules and tsc failed with "Cannot find module".
#
# Guarantees (mandate):
#   - deterministic dependency install from the lockfile (npm ci)
#   - fail-fast: git pull / npm ci / tsc / build failure STOPS the deploy
#   - nginx is reloaded ONLY after a successful build
#   - "deployed" is never claimed on a failed step
#
# Usage (on the server):
#   bash scripts/deploy.sh              # frontend deploy
#   DEPLOY_BACKEND=1 bash scripts/deploy.sh   # also build+restart backend
#   RUN_TESTS=1 bash scripts/deploy.sh  # also run the frontend test suite
#
# Env:
#   BRANCH   (default: fix/p0-p1-remediation)
#   REPO     (default: $HOME/USAM-Learning-Worlds)
# =============================================================================
set -euo pipefail

BRANCH="${BRANCH:-fix/p0-p1-remediation}"
REPO="${REPO:-$HOME/USAM-Learning-Worlds}"
DEPLOY_BACKEND="${DEPLOY_BACKEND:-0}"
RUN_TESTS="${RUN_TESTS:-0}"

log()  { echo -e "\n\033[1;36m▶ $1\033[0m"; }
ok()   { echo -e "  \033[1;32m✔ $1\033[0m"; }
die()  { echo -e "  \033[1;31mx DEPLOY ABORTED: $1\033[0m" >&2; exit 1; }

cd "$REPO" || die "repo not found at $REPO"

# --------------------------------------------------------------- 1. SOURCE
log "[1/7] Syncing source ($BRANCH)"
git fetch origin "$BRANCH" || die "git fetch failed"
git checkout "$BRANCH" || die "git checkout failed"
git pull --ff-only origin "$BRANCH" || die "git pull (ff-only) failed — resolve divergence first"
LOCAL_COMMIT="$(git rev-parse --short HEAD)"
REMOTE_COMMIT="$(git rev-parse --short "origin/$BRANCH")"
[ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ] || die "local ($LOCAL_COMMIT) != remote ($REMOTE_COMMIT) after pull"
ok "source at $LOCAL_COMMIT"

# --------------------------------------------------------------- 2. BACKEND (optional)
if [ "$DEPLOY_BACKEND" = "1" ]; then
  log "[2/7] Backend: install + build + drift gates + tests + restart"
  ( cd backend && npm ci --include=dev && npm run build ) || die "backend build failed"

  # MANDATORY DRIFT GATES (audit 71): both caught real production defects
  # (SubscriptionStatus enum drift that 500'd all mission starts; 11 missing
  # columns). They are permanent, non-optional gates now — the deploy STOPS
  # (never restarts/cuts over) if the live DB schema drifts from the code.
  #   - check:enum-drift  : every Prisma enum has a matching Postgres type+values
  #   - check:migrations  : every CREATE TABLE / ADD COLUMN exists in the live DB
  # These read DATABASE_URL from backend/.env the same way Prisma does.
  ( cd backend && npm run check:enum-drift ) || die "ENUM DRIFT detected — see audit 71; fix before deploy"
  ( cd backend && npm run check:migrations ) || die "MIGRATION DRIFT detected — apply missing migrations before deploy"
  ok "drift gates passed (enum + migrations)"

  # Backend test suite as a release gate (opt-out only via SKIP_BACKEND_TESTS=1
  # for emergencies, which must be a conscious choice, not a default).
  if [ "${SKIP_BACKEND_TESTS:-0}" = "1" ]; then
    log "  backend tests: SKIPPED (SKIP_BACKEND_TESTS=1 — emergency override)"
  else
    ( cd backend && npm test ) || die "backend tests failed"
    ok "backend tests passed"
  fi

  pm2 restart usam-backend --update-env || die "pm2 restart failed"
  ok "backend rebuilt + restarted"
else
  log "[2/7] Backend: skipped (set DEPLOY_BACKEND=1 to include)"
fi

# --------------------------------------------------------------- 3. FRONTEND DEPS
log "[3/7] Frontend: deterministic dependency install (npm ci)"
cd "$REPO/frontend"
npm ci --include=dev || die "npm ci failed — lockfile out of sync?"
# Verify the frontend's core runtime deps actually resolved after npm ci (this
# guards the class of failure where package.json changed but node_modules was
# stale). Uses `react` + the router + query layer, which BOTH the legacy and the
# rebuilt frontend depend on, so this check survives the Decision A cutover.
# (The old Radix/cva-specific check was removed with the rebuild — those are not
# dependencies of the new frontend.)
npm ls react react-dom react-router-dom @tanstack/react-query \
  >/dev/null 2>&1 || die "expected core frontend dependencies are missing after npm ci"
ok "dependencies installed + core deps verified"

# --------------------------------------------------------------- 4. TYPECHECK
log "[4/7] Typecheck (tsc --noEmit)"
npx tsc --noEmit || die "typecheck failed"
ok "typecheck clean"

# --------------------------------------------------------------- 5. TESTS (optional)
if [ "$RUN_TESTS" = "1" ]; then
  log "[5/7] Tests (npm test)"
  npm test || die "tests failed"
  ok "tests passed"
else
  log "[5/7] Tests: skipped (set RUN_TESTS=1 to include)"
fi

# --------------------------------------------------------------- 6. BUILD
log "[6/7] Production build"
rm -rf dist node_modules/.vite
npm run build || die "build failed"
[ -f dist/index.html ] || die "build produced no dist/index.html"
# Perf gate: Home must not eagerly load the coding runtime (sandpack/codemirror/
# pyodide). Cheap + deterministic — reads dist/index.html (see task #16).
npm run check:home-bundle || die "home-bundle perf gate failed — coding runtime leaked into the Home load"
# Record deploy metadata for drift detection (read by verify-deployment.sh).
LOCK_HASH="$( (sha256sum package-lock.json 2>/dev/null || shasum -a 256 package-lock.json) | cut -d' ' -f1 | cut -c1-12 )"
cat > dist/deploy-meta.json <<EOF
{ "commit": "$LOCAL_COMMIT", "branch": "$BRANCH", "lockHash": "$LOCK_HASH", "builtAt": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" }
EOF
ok "build succeeded ($LOCAL_COMMIT, lock $LOCK_HASH)"

# --------------------------------------------------------------- 7. RELEASE
log "[7/7] Reload nginx + verify"
sudo systemctl reload nginx || die "nginx reload failed"
ok "nginx reloaded"

SOURCE_COMMIT="$LOCAL_COMMIT" bash "$REPO/scripts/verify-deployment.sh" || die "post-deploy verification failed"
echo -e "\n\033[1;32m✅ DEPLOY COMPLETE — $LOCAL_COMMIT live and verified\033[0m"
