#!/bin/bash
# This script intentionally contains NO secrets.
# All real values (JWT secrets, DATABASE_URL, ALLOWED_ORIGINS, etc.) live in
# backend/.env.production on each deployment target, which is gitignored
# (matches the ".env.*" pattern in .gitignore) and never committed.
# See backend/.env.example for the full list of variables that must be set.
set -a
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env.production" ]; then
  source "$SCRIPT_DIR/.env.production"
else
  echo "FATAL: $SCRIPT_DIR/.env.production not found. Copy backend/.env.example, fill in real values, save as .env.production." >&2
  exit 1
fi
set +a

cd "$SCRIPT_DIR"
node dist/src/main.js
