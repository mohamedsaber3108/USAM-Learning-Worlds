/**
 * Migration drift safety net.
 *
 * WHY THIS EXISTS:
 * Migrations in prisma/migrations/*.sql are applied manually via psql in
 * this project, not via `prisma migrate deploy` (there is no
 * migration_lock.toml / real Prisma migration history table). That means
 * Prisma has no built-in way to tell us whether a given migration file was
 * ever actually run against the live database. In a real incident, 21
 * tables defined across multiple migration files had silently never been
 * applied to production — the app kept working (nothing crashed at
 * startup) until code that used those tables hit a hard runtime error.
 *
 * WHAT THIS SCRIPT DOES:
 *   1. Reads every prisma/migrations/*.sql file.
 *   2. Regex-extracts every `CREATE TABLE ["<name>"` (and
 *      `CREATE TABLE IF NOT EXISTS "<name>"`) statement to build the list
 *      of tables the migration history *expects* to exist.
 *   3. Queries information_schema.tables on the live DATABASE_URL to see
 *      what actually exists in the current schema.
 *   4. Reports any expected table that is missing, with a non-zero exit
 *      code, so it can be wired into CI or run manually before deploys.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - It does not check column-level or constraint-level drift, only
 *     table existence. That's the failure mode that actually bit us.
 *   - It does not attempt to apply anything. It is read-only / diagnostic.
 *
 * HOW TO RUN:
 *   cd backend
 *   npm run check:migrations
 *
 * Requires DATABASE_URL to be set (reads it the same way Prisma does,
 * via backend/.env or the environment).
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

interface ExpectedTable {
  table: string;
  file: string;
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'prisma', 'migrations');

// Matches: CREATE TABLE "name" (          and
//          CREATE TABLE IF NOT EXISTS "name" (
// Table names in this codebase's migrations are always double-quoted.
const CREATE_TABLE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"([A-Za-z0-9_]+)"/gi;

export function extractCreatedTables(sql: string): string[] {
  const tables: string[] = [];
  let match: RegExpExecArray | null;
  // Reset lastIndex-based global regex use is per-call-safe because we
  // construct a fresh RegExp object reference each call via exec loop on
  // a shared pattern — but to be safe against global-state bugs, clone it.
  const re = new RegExp(CREATE_TABLE_RE.source, CREATE_TABLE_RE.flags);
  while ((match = re.exec(sql)) !== null) {
    tables.push(match[1]);
  }
  return tables;
}

function collectExpectedTables(migrationsDir: string): ExpectedTable[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort();

  const expected: ExpectedTable[] = [];
  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    for (const table of extractCreatedTables(sql)) {
      expected.push({ table, file });
    }
  }
  return expected;
}

async function getExistingTables(prisma: PrismaClient): Promise<Set<string>> {
  const rows = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
     AND table_type = 'BASE TABLE'`,
  );
  return new Set(rows.map((r) => r.table_name));
}

async function main() {
  const expected = collectExpectedTables(MIGRATIONS_DIR);

  if (expected.length === 0) {
    console.log(
      `No CREATE TABLE statements found under ${MIGRATIONS_DIR}. Nothing to check.`,
    );
    return;
  }

  // De-dupe by table name, but remember every migration file that
  // (re-)declares it, since "CREATE TABLE IF NOT EXISTS" can legitimately
  // appear more than once across files.
  const byTable = new Map<string, Set<string>>();
  for (const { table, file } of expected) {
    if (!byTable.has(table)) byTable.set(table, new Set());
    byTable.get(table)!.add(file);
  }

  console.log(
    `Found ${byTable.size} distinct table(s) referenced by CREATE TABLE across ${
      new Set(expected.map((e) => e.file)).size
    } migration file(s) in prisma/migrations/.`,
  );

  const prisma = new PrismaClient();
  let existing: Set<string>;
  try {
    existing = await getExistingTables(prisma);
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Live schema currently has ${existing.size} base table(s).`);

  const missing: { table: string; files: string[] }[] = [];
  for (const [table, files] of byTable.entries()) {
    if (!existing.has(table)) {
      missing.push({ table, files: Array.from(files).sort() });
    }
  }

  if (missing.length === 0) {
    console.log(
      '\n✅ All tables declared by CREATE TABLE in prisma/migrations/*.sql exist in the live schema.',
    );
    return;
  }

  missing.sort((a, b) => a.table.localeCompare(b.table));

  console.error(
    `\n❌ MIGRATION DRIFT DETECTED: ${missing.length} table(s) declared in migrations but MISSING from the live database:\n`,
  );
  for (const m of missing) {
    console.error(`  - "${m.table}"  (declared in: ${m.files.join(', ')})`);
  }
  console.error(
    '\nThis usually means one or more .sql files under prisma/migrations/ were never run against ' +
      'this DATABASE_URL (migrations here are applied manually via psql, not `prisma migrate deploy`). ' +
      'Apply the missing migration(s) manually and re-run `npm run check:migrations` to confirm.',
  );

  process.exitCode = 1;
}

main().catch((err) => {
  console.error('check-migrations-applied failed:', err);
  process.exitCode = 1;
});
