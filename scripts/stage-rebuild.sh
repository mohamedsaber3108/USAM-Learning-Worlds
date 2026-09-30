#!/usr/bin/env bash
# =============================================================================
# USAM Kids — STAGE the rebuilt frontend (frontend-rebuild/) for verification.
#
# CONTROLLED REPLACEMENT (Decision A): this does NOT touch the live production
# frontend (frontend/ @ 1ae4dcd stays serving). It runs the same fail-fast gates
# as deploy.sh against frontend-rebuild/ and produces its dist so the owner can
# verify the new build (served from a staging nginx location or `vite preview`)
# BEFORE the traffic switch. Nothing is cut over here.
#
# Usage (on the server):
#   bash scripts/stage-rebuild.sh
#
# Env: BRANCH (default fix/p0-p1-remediation), REPO (default $HOME/USAM-Learning-Worlds)
# =============================================================================
set -euo pipefail

BRANCH="${BRANCH:-fix/p0-p1-remediation}"
REPO="${REPO:-$HOME/USAM-Learning-Worlds}"

log() { echo -e "\n\033[1;36m▶ $1\033[0m"; }
ok()  { echo -e "  \033[1;32m✔ $1\033[0m"; }
die() { echo -e "  \033[1;31mx STAGE ABORTED: $1\033[0m" >&2; exit 1; }

cd "$REPO" || die "repo not found at $REPO"

log "[1/6] Sync source ($BRANCH)"
git fetch origin "$BRANCH" || die "git fetch failed"
git checkout "$BRANCH" || die "git checkout failed"
git pull --ff-only origin "$BRANCH" || die "git pull (ff-only) failed"
COMMIT="$(git rev-parse --short HEAD)"
ok "source at $COMMIT"

cd "$REPO/frontend-rebuild" || die "frontend-rebuild/ not found"

log "[2/6] Install (npm ci)"
npm ci --include=dev || die "npm ci failed — lockfile out of sync?"
ok "deps installed"

log "[3/6] Typecheck"
npx tsc -b --noEmit || die "typecheck failed"
ok "typecheck clean"

log "[4/6] Tests"
npm test || die "tests failed"
ok "tests passed"

log "[5/6] Production build"
rm -rf dist node_modules/.vite
npm run build || die "build failed"
[ -f dist/index.html ] || die "build produced no dist/index.html"
ok "build succeeded"

log "[6/6] Home-bundle perf gate"
npm run check:home-bundle || die "home-bundle perf gate failed — coding runtime leaked into Home"
ok "perf gate passed"

cat > dist/deploy-meta.json <<EOF
{ "commit": "$COMMIT", "branch": "$BRANCH", "tree": "frontend-rebuild", "builtAt": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" }
EOF

echo -e "\n\033[1;32m✅ REBUILD STAGED — $COMMIT built at frontend-rebuild/dist (NOT cut over)\033[0m"
echo "Next: verify it (e.g. 'npm run preview' in frontend-rebuild, or point a staging nginx"
echo "location at frontend-rebuild/dist), run the role journeys + EN/AR browser QA, compare to"
echo "the live 1ae4dcd baseline. Only after that: run scripts/switch-to-rebuild.sh to cut over."
