# 73 — Production Maintenance Runbook

Covers two operational items surfaced during the displayName live-verification
session: (A) cleaning up the test accounts created during verification, and
(B) the pending host reboot (`*** System restart required ***`).

---

## A. Test-user cleanup (FK-aware)

### Accounts created during verification
| email | userId | learnerId | why |
|---|---|---|---|
| `sara-dup-1@test.local` | `6f031054-1273-4dcd-8a9b-463a8f713d1c` | `4bf3a865-88e0-4b41-98e2-819dc72105d1` | displayName dup proof #1 |
| `sara-dup-2@test.local` | `7d6effd7-292c-4a60-8260-24fe055b88e5` | `b013a290-0fe5-4815-a1cc-2a57b7d975d6` | displayName dup proof #2 |
| `proof-learner@test.local` | (see DB) | (see DB) | English + Coding loop proof learner |

**Recommendation:** KEEP `proof-learner@test.local` for now — it is the learner
used to prove the English loop live and will be reused for the Coding loop proof
(task #6). Remove the two `sara-dup-*` accounts (single-purpose, done their job).
Delete `proof-learner@test.local` only after the Coding live proof is recorded.

### Why deleting the User is the FK-safe root
Every learner-owned relation (progression, evidence, mastery_records,
mission_runs, activity_attempts, guardianships, …) is declared `onDelete: Cascade`
in schema.prisma, and `Learner.userId → User` is Cascade. Deleting the `users`
row is the single cascade root:
- If the live DB has the FK `ON DELETE CASCADE` (from the baseline), all
  dependents are removed automatically.
- If it does NOT, the delete FAILS on a FK constraint (safe) rather than
  orphaning rows — you'd then delete children first. It never silently orphans.

### Cleanup commands (run on prod)
```bash
DB_URL="$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | tr -d '"')"

# 1) Preview what will go (confirm exactly 2 users, and any dependents).
psql "$DB_URL" -c "SELECT u.id, u.email, l.id AS learner_id
  FROM users u LEFT JOIN learners l ON l.\"userId\"=u.id
  WHERE u.email IN ('sara-dup-1@test.local','sara-dup-2@test.local');"

# 2) Delete inside a transaction (rolls back automatically on any FK error).
psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
DELETE FROM users WHERE email IN ('sara-dup-1@test.local','sara-dup-2@test.local');
-- verify count == 2 before committing:
SELECT count(*) AS remaining FROM users WHERE email LIKE 'sara-dup-%@test.local';
COMMIT;
SQL

# 3) Confirm gone + no orphaned learners.
psql "$DB_URL" -c "SELECT count(*) FROM users WHERE email LIKE 'sara-dup-%@test.local';"
psql "$DB_URL" -c "SELECT count(*) FROM learners
  WHERE id IN ('4bf3a865-88e0-4b41-98e2-819dc72105d1','b013a290-0fe5-4815-a1cc-2a57b7d975d6');"
```
Expected: step 3 both return 0. If step 2 errors on a FK (no DB-level cascade),
the BEGIN/ON_ERROR_STOP rolls it all back — then delete child rows for those
learnerIds first (mastery_records, evidence, activity_attempts via their runs,
progression, guardianships) and retry. Document whichever path was needed.

> Do NOT use a broad `DELETE FROM learners WHERE displayName='Sara'` — displayName
> is intentionally non-unique now, so that could match unrelated real children.
> Always target by the specific userId/email/learnerId above.

---

## A2. DB table-ownership blocker (found 2026-09-28)

Applying `20260930_fix_drift_intervention_escalation_fsrs.sql` on prod: the enum
types, `intervention_recommendations` table, and enum-value additions ALL applied
(enum drift now 0 — `check:enum-drift` green, 45/45). But the 9 `ALTER TABLE …
ADD COLUMN` on `safety_escalations` (2) and `flashcard_reviews` (7) failed with:
```
ERROR: must be owner of table safety_escalations
ERROR: must be owner of table flashcard_reviews
```
Root cause: **the app DB role (DATABASE_URL) is not the OWNER of those two
tables** — it can CREATE TYPE/TABLE (owns what it creates: intervention_* worked)
but cannot ALTER tables owned by a different role (likely `postgres`/admin from an
older baseline apply). This is a privileges issue, not a migration bug. The 9
columns are additive, non-breaking, and NOT on the English/Coding hot path (FSRS
flashcard scheduler state; safety-escalation human-resolution audit trail), so
nothing live-proven is affected — but the FSRS scheduler + escalation-resolution
features stay degraded until the columns exist.

Diagnose ownership:
```bash
DB_URL="$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | tr -d '"')"
psql "$DB_URL" -c "SELECT current_user AS app_role;"
psql "$DB_URL" -c "SELECT tablename, tableowner FROM pg_tables
  WHERE tablename IN ('safety_escalations','flashcard_reviews','intervention_recommendations') ORDER BY tablename;"
```

Fix — **Option A (do now, minimal):** run the 9 ALTERs as the table OWNER/admin role
(the 9 ADD COLUMN IF NOT EXISTS statements from the migration; they're idempotent).
**Option B (root cause, follow-up):** `ALTER TABLE safety_escalations OWNER TO <app_role>;
ALTER TABLE flashcard_reviews OWNER TO <app_role>;` as admin, so future migrations
by the app role don't hit this. Broad ownership change = shared-system decision;
raise before doing B. After either, re-run `npm run check:migrations` → must be green.

## B. Host reboot (`*** System restart required ***`)

### Why a restart is flagged
Ubuntu sets `/var/run/reboot-required` after package upgrades that can't hot-apply
— typically a **kernel** update (the login banner showed `7.0.0-1010-aws`) and/or
core lib(glibc/systemd) updates. 38 updates were pending. Confirm the exact reason:
```bash
cat /var/run/reboot-required 2>/dev/null
cat /var/run/reboot-required.pkgs 2>/dev/null   # lists the packages that require it
```
This is NOT urgent for correctness (the app runs fine on the current kernel); it
is a security/patch-hygiene item — apply in a maintenance window, not blindly
during active use.

### Blast radius / downtime
- Full reboot ≈ 1–3 min of total unavailability (single EC2 host: nginx, Node/PM2
  backend, Postgres, Redis all restart).
- Users online at reboot get dropped requests during that window; JWTs survive
  (stateless), so they can retry after.

### Startup behavior after reboot — VERIFY each does not need manual start
- **PM2 (backend)**: only auto-starts if `pm2 startup` + `pm2 save` were run.
  Check: `pm2 startup` (shows if a systemd unit exists) and confirm a saved dump
  (`~/.pm2/dump.pm2`). If not configured, the backend will NOT come back on its
  own — set it up BEFORE rebooting:
  ```bash
  pm2 save
  pm2 startup    # run the sudo command it prints, then pm2 save again
  ```
- **nginx / postgres / redis**: usually enabled systemd services (auto-start).
  Confirm: `systemctl is-enabled nginx postgresql redis-server`.

### Pre-reboot checklist
```bash
pm2 save                                   # persist current process list
systemctl is-enabled nginx postgresql redis-server pm2-ubuntu 2>/dev/null
cat /var/run/reboot-required.pkgs          # record what the reboot is for
```

### Reboot + rollback
- Reboot: `sudo reboot` in the window. (AWS: if it fails to come back, the EC2
  console + stop/start is the recovery path; the root EBS volume persists.)
- Rollback: kernel updates keep the previous kernel in GRUB — if the new kernel
  misbehaves, boot the prior entry. App/data on EBS are unaffected by kernel choice.

### Post-reboot verification checklist
```bash
BASE="http://localhost:3000/api"
systemctl is-active nginx postgresql redis-server        # all "active"
pm2 list                                                 # usam-backend "online"
curl -s -o /dev/null -w "health %{http_code}\n" "$BASE/health"          # 200
DB_URL="$(grep -E '^DATABASE_URL=' backend/.env | head -1 | cut -d= -f2- | tr -d '"')"
psql "$DB_URL" -c "SELECT 1;"                            # DB connectivity
# Redis/queues: mastery recalc is a Bull queue — confirm Redis reachable:
redis-cli ping                                           # PONG
# Critical authenticated route (login + a mission start) — smoke:
TOKEN=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"proof-learner@test.local","password":"Passw0rd!23"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin).get("accessToken",""))')
echo "auth token len: ${#TOKEN}"
# Frontend: load the site root returns 200 (nginx serving the SPA)
curl -s -o /dev/null -w "frontend %{http_code}\n" https://kids.usamif.com/
```
All green → reboot successful. If PM2 didn't restore the backend, run
`pm2 resurrect` (or `pm2 start` from the saved dump) and re-run the checklist.
