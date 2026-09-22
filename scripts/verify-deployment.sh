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
  [ "$LOCAL" = "$REMOTE" ] && pass "local matches remote" || fail "local ($LOCAL) != remote ($REMOTE) — pull/deploy needed"
  DIRTY=$(git status --porcelain 2>/dev/null | grep -v "frontend/.env" | wc -l)
  [ "$DIRTY" -eq 0 ] && pass "working tree clean" || info "$DIRTY uncommitted change(s) (ignoring frontend/.env)"
else
  info "repo not found at $REPO (skipping git state)"
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

echo ""
echo "==============================================================="
if [ "$FAIL" -eq 0 ]; then
  echo " ✅ ALL CHECKS PASSED — deployment verified"
else
  echo " ❌ SOME CHECKS FAILED — see above"
fi
echo "==============================================================="
exit $FAIL
