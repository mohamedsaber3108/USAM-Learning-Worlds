#!/usr/bin/env bash
# =============================================================================
# USAM Kids — Deployment Verification (mandate Command A + Command B)
#
# Run on the server after a deploy. Verifies the live app is actually serving
# the current build and that critical backend contracts respond correctly.
# Never claims "deployed" without checking. Exit code 0 = all green.
#
# Usage:  bash scripts/verify-deployment.sh
# =============================================================================
set -uo pipefail

BASE="${USAM_BASE:-https://kids.usamif.com}"
API="$BASE/api"
REPO="${USAM_REPO:-$HOME/USAM-Learning-Worlds}"
FAIL=0

pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; FAIL=1; }
info() { echo "  •  $1"; }

echo "==============================================================="
echo " USAM Kids deployment verification — $BASE"
echo " $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "==============================================================="

# ---------------------------------------------------------------- COMMAND A
echo ""
echo "[A] DEPLOYMENT STATE"
if [ -d "$REPO/.git" ]; then
  cd "$REPO"
  BRANCH=$(git branch --show-current 2>/dev/null)
  LOCAL=$(git rev-parse --short HEAD 2>/dev/null)
  git fetch origin --quiet 2>/dev/null
  REMOTE=$(git rev-parse --short "origin/$BRANCH" 2>/dev/null)
  info "branch: $BRANCH"
  info "local commit:  $LOCAL"
  info "remote commit: $REMOTE"
  if [ "$LOCAL" = "$REMOTE" ]; then
    pass "local matches remote"
  elif [ -n "${SOURCE_COMMIT:-}" ]; then
    # Invoked by deploy.sh, which already enforced local==remote before build;
    # a lag here is just the shell checkout, not the deployed artifact.
    info "checkout local ($LOCAL) != remote ($REMOTE) — deployed-artifact commit is authoritative (see deploy-meta)"
  else
    fail "local ($LOCAL) != remote ($REMOTE) — pull/deploy needed"
  fi
  DIRTY=$(git status --porcelain 2>/dev/null | grep -v "frontend/.env" | wc -l)
  [ "$DIRTY" -eq 0 ] && pass "working tree clean" || info "$DIRTY uncommitted change(s) (ignoring frontend/.env)"
else
  info "repo not found at $REPO (skipping git state)"
fi

# Deploy metadata (written by scripts/deploy.sh at build time) — the authoritative
# record of WHICH commit the deployed artifact was actually built from. This is
# what "deployed commit" means; the git checkout can lag without changing what's live.
META="$REPO/frontend/dist/deploy-meta.json"
if [ -f "$META" ]; then
  DEPLOYED_COMMIT=$(grep -o '"commit": *"[^"]*"' "$META" | cut -d'"' -f4)
  DEPLOYED_LOCK=$(grep -o '"lockHash": *"[^"]*"' "$META" | cut -d'"' -f4)
  BUILT_AT=$(grep -o '"builtAt": *"[^"]*"' "$META" | cut -d'"' -f4)
  info "deployed commit: ${DEPLOYED_COMMIT:-<none>} (built $BUILT_AT, lock $DEPLOYED_LOCK)"
  if [ -n "${SOURCE_COMMIT:-}" ] && [ -n "$DEPLOYED_COMMIT" ]; then
    [ "$SOURCE_COMMIT" = "$DEPLOYED_COMMIT" ] \
      && pass "deployed artifact matches source commit ($DEPLOYED_COMMIT)" \
      || fail "DRIFT: deployed artifact ($DEPLOYED_COMMIT) != source ($SOURCE_COMMIT) — rebuild"
  fi
else
  info "no dist/deploy-meta.json (built by an older/manual path; run scripts/deploy.sh for drift detection)"
fi

# Frontend build hash: what index.html references vs what dist serves.
BUILT=$(grep -o 'index-[A-Za-z0-9_-]*\.js' "$REPO/frontend/dist/index.html" 2>/dev/null | head -1)
LIVE=$(curl -s "$BASE/" | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1)
info "built bundle: ${BUILT:-<none>}"
info "live bundle:  ${LIVE:-<none>}"
if [ -n "$BUILT" ] && [ "$BUILT" = "$LIVE" ]; then pass "live bundle matches build"; else fail "live bundle != build (stale deploy or cache)"; fi

# ---------------------------------------------------------------- COMMAND B
echo ""
echo "[B] POST-DEPLOYMENT VERIFICATION"

# Helper: expect a specific HTTP status from a URL (optionally a method).
check_status() {
  local label="$1" url="$2" want="$3" method="${4:-GET}"
  local got
  got=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
  if [ "$got" = "$want" ]; then pass "$label ($got)"; else fail "$label expected $want got $got"; fi
}

# Application loads
check_status "app loads (/)"                 "$BASE/"                              200
# Backend health
check_status "backend health"                "$API/health"                        200
# Auth contract exists (401 = route present, needs auth — the correct signal)
check_status "auth: /auth/me guarded"        "$API/auth/me"                       401
check_status "auth: age-band guarded"        "$API/auth/me/age-band"              401 PATCH
check_status "auth: preferences guarded"     "$API/auth/me/preferences"           401 PATCH
# Core learner engines (guarded → 401 when unauthenticated = route is live)
check_status "gamification/progression"      "$API/gamification/progression"      401
check_status "mastery/by-domain"             "$API/mastery/by-domain"             401
check_status "adaptive/recommendations"      "$API/adaptive/recommendations"      401
check_status "missions"                      "$API/missions"                      401
check_status "worlds"                        "$API/worlds"                        401
check_status "simulations"                   "$API/simulations"                   401
check_status "credentials/me"                "$API/credentials/me"                401
check_status "learning/paths"                "$API/learning/paths"                401

# Login endpoint should reject bad creds with 401 (not 404/500) — proves the
# auth pipeline is wired, without needing real credentials.
LOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' -d '{"email":"noone@example.com","password":"x"}')
if [ "$LOGIN" = "401" ] || [ "$LOGIN" = "400" ]; then pass "auth/login rejects bad creds ($LOGIN)"; else fail "auth/login expected 401/400 got $LOGIN"; fi

# Critical frontend routes are served (SPA — all should return the app shell 200)
for r in /login /register /dashboard /worlds /simulations /balanced; do
  check_status "route $r" "$BASE$r" 200
done

# ---------------------------------------------------------------- COMMAND C
# Service-worker + cache hygiene (added after the "new build deployed but old
# UI persists" investigation). USAM has NO service worker (verified: none in
# any tree or git history). These URLs must therefore NOT fall through to the
# SPA index.html with a 200 — an HTML body served as /sw.js is ambiguous and
# could be mistaken for a worker. They must 404. And index.html must be
# revalidated (no-cache) so returning visitors always get the newest shell,
# while hashed /assets/* may cache immutably.
echo ""
echo "[C] SERVICE-WORKER + CACHE HYGIENE"

# /sw.js and /service-worker.js must NOT be served as a cached JS worker.
# Accept 404 (preferred) or 410. A 200 with text/html is the SPA-fallback
# ambiguity we are eliminating; a 200 with javascript would be a real rogue SW.
for sw in /sw.js /service-worker.js; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$sw")
  ctype=$(curl -s -o /dev/null -w "%{content_type}" "$BASE$sw")
  if [ "$code" = "404" ] || [ "$code" = "410" ]; then
    pass "$sw retired ($code)"
  elif printf '%s' "$ctype" | grep -qi 'javascript'; then
    fail "$sw is served as JAVASCRIPT ($code $ctype) — a real/rogue service worker is live"
  else
    fail "$sw returns $code ($ctype) — must be 404/410, not an SPA fallback (ambiguous)"
  fi
done

# index.html must be revalidated so a new deploy is picked up without manual
# cache clearing. Fail if it is served immutable/long-max-age.
CC_HDR=$(curl -sI "$BASE/" | grep -i '^cache-control:' | tr -d '\r')
info "index.html ${CC_HDR:-<no cache-control header>}"
if printf '%s' "$CC_HDR" | grep -qiE 'no-cache|no-store|max-age=0'; then
  pass "index.html is revalidated (no-cache)"
elif printf '%s' "$CC_HDR" | grep -qiE 'immutable|max-age=([1-9][0-9]{3,})'; then
  fail "index.html is long-cached ($CC_HDR) — returning visitors can be stuck on an old shell"
else
  info "index.html cache-control not explicitly no-cache — recommend adding it (see docs/ops/NGINX_CACHE.md)"
fi

# Hashed assets SHOULD be immutable-cacheable (perf). Informational only.
if [ -n "$LIVE" ]; then
  AC=$(curl -sI "$BASE/assets/$LIVE" | grep -i '^cache-control:' | tr -d '\r')
  info "assets ${AC:-<no cache-control header>}"
fi

echo ""
echo "==============================================================="
if [ "$FAIL" -eq 0 ]; then
  echo " ✅ ALL CHECKS PASSED — deployment verified"
else
  echo " ❌ SOME CHECKS FAILED — see above"
fi
echo "==============================================================="
exit $FAIL
