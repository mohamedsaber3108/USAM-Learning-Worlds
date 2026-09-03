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
 *   2b. (Added Tick 48, after a second real incident) Also regex-extracts
 *      every `ALTER TABLE "<table>" ADD COLUMN [IF NOT EXISTS] "<col>"`
 *      statement, and checks each expected column against
 *      information_schema.columns the same way table existence is checked.
 *      Tick 48 found 10 real missing columns across several tables
 *      (activities.assessmentPurpose, translations.isHumanApproved,
 *      projects.competencyId, avatar_cosmetics.license, etc.) that this
 *      table-only check would have silently missed — this closes that gap.
 *   3. Queries information_schema.tables/columns on the live DATABASE_URL
 *      to see what actually exists in the current schema.
 *   4. Reports any expected table OR column that is missing, with a
 *      non-zero exit code, so it can be wired into CI or run manually
 *      before deploys.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - It does not check constraint-level, index-level, or type-level
 *     drift, only table and column existence.
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

interface ExpectedColumn {
  table: string;
  column: string;
  file: string;
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'prisma', 'migrations');

// Matches: CREATE TABLE "name" (          and
//          CREATE TABLE IF NOT EXISTS "name" (
// Table names in this codebase's migrations are always double-quoted.
const CREATE_TABLE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"([A-Za-z0-9_]+)"/gi;

// Matches: ALTER TABLE "table" ADD COLUMN "col"           and
//          ALTER TABLE "table" ADD COLUMN IF NOT EXISTS "col"
// Only matches the (table, col) pair on the SAME statement occurrence —
// multi-column ALTER TABLE statements with several ADD COLUMN clauses are
// handled by the caller re-scanning with the table name held from the
// preceding ALTER TABLE clause (see extractAddedColumns).
const ALTER_TABLE_RE = /ALTER\s+TABLE\s+"([A-Za-z0-9_]+)"/gi;
const ADD_COLUMN_RE = /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?"([A-Za-z0-9_]+)"/gi;

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

/**
 * Extracts (table, column) pairs from ALTER TABLE ... ADD COLUMN
 * statements. Handles the multi-statement style used throughout this
 * project's migrations, where each ALTER TABLE statement is terminated by
 * a semicolon and may contain one or more comma-separated ADD COLUMN
 * clauses. Splits the SQL into statements on ";" first so an ADD COLUMN
 * clause is never attributed to the wrong table from a later statement.
 */
export function extractAddedColumns(sql: string): { table: string; column: string }[] {
  const results: { table: string; column: string }[] = [];
  const statements = sql.split(';');
  for (const stmt of statements) {
    const tableMatch = new RegExp(ALTER_TABLE_RE.source, ALTER_TABLE_RE.flags).exec(stmt);
    if (!tableMatch) continue;
    const table = tableMatch[1];
    const colRe = new RegExp(ADD_COLUMN_RE.source, ADD_COLUMN_RE.flags);
    let colMatch: RegExpExecArray | null;
    while ((colMatch = colRe.exec(stmt)) !== null) {
      results.push({ table, column: colMatch[1] });
    }
  }
  return results;
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

function collectExpectedColumns(migrationsDir: string): ExpectedColumn[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort();

  const expected: ExpectedColumn[] = [];
  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    for (const { table, column } of extractAddedColumns(sql)) {
      expected.push({ table, column, file });
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

async function getExistingColumns(prisma: PrismaClient): Promise<Set<string>> {
  const rows = await prisma.$queryRawUnsafe<{ table_name: string; column_name: string }[]>(
    `SELECT table_name, column_name
     FROM information_schema.columns
     WHERE table_schema NOT IN ('pg_catalog', 'information_schema')`,
  );
  return new Set(rows.map((r) => `${r.table_name}.${r.column_name}`));
}

async function main() {
  const expected = collectExpectedTables(MIGRATIONS_DIR);
  const expectedColumns = collectExpectedColumns(MIGRATIONS_DIR);

  if (expected.length === 0 && expectedColumns.length === 0) {
    console.log(
      `No CREATE TABLE or ALTER TABLE ADD COLUMN statements found under ${MIGRATIONS_DIR}. Nothing to check.`,
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

  // Same de-dupe for (table, column) pairs.
  const byColumn = new Map<string, Set<string>>();
  for (const { table, column, file } of expectedColumns) {
    const key = `${table}.${column}`;
    if (!byColumn.has(key)) byColumn.set(key, new Set());
    byColumn.get(key)!.add(file);
  }

  console.log(
    `Found ${byTable.size} distinct table(s) referenced by CREATE TABLE and ${byColumn.size} ` +
      `distinct column(s) referenced by ALTER TABLE ADD COLUMN across ` +
      `${new Set([...expected.map((e) => e.file), ...expectedColumns.map((e) => e.file)]).size} ` +
      `migration file(s) in prisma/migrations/.`,
  );

  const prisma = new PrismaClient();
  let existingTables: Set<string>;
  let existingColumns: Set<string>;
  try {
    existingTables = await getExistingTables(prisma);
    existingColumns = await getExistingColumns(prisma);
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Live schema currently has ${existingTables.size} base table(s).`);

  const missingTables: { table: string; files: string[] }[] = [];
  for (const [table, files] of byTable.entries()) {
    if (!existingTables.has(table)) {
      missingTables.push({ table, files: Array.from(files).sort() });
    }
  }

  const missingColumns: { table: string; column: string; files: string[] }[] = [];
  for (const [key, files] of byColumn.entries()) {
    if (!existingColumns.has(key)) {
      const [table, column] = key.split('.');
      missingColumns.push({ table, column, files: Array.from(files).sort() });
    }
  }

  if (missingTables.length === 0 && missingColumns.length === 0) {
    console.log(
      '\n✅ All tables declared by CREATE TABLE and all columns declared by ALTER TABLE ADD COLUMN ' +
        'in prisma/migrations/*.sql exist in the live schema.',
    );
    return;
  }

  missingTables.sort((a, b) => a.table.localeCompare(b.table));
  missingColumns.sort((a, b) => `${a.table}.${a.column}`.localeCompare(`${b.table}.${b.column}`));

  if (missingTables.length > 0) {
    console.error(
      `\n❌ MIGRATION DRIFT DETECTED: ${missingTables.length} table(s) declared in migrations but MISSING from the live database:\n`,
    );
    for (const m of missingTables) {
      console.error(`  - "${m.table}"  (declared in: ${m.files.join(', ')})`);
    }
  }

  if (missingColumns.length > 0) {
    console.error(
      `\n❌ MIGRATION DRIFT DETECTED: ${missingColumns.length} column(s) declared in migrations but MISSING from the live database:\n`,
    );
    for (const m of missingColumns) {
      console.error(`  - "${m.table}"."${m.column}"  (declared in: ${m.files.join(', ')})`);
    }
  }

  console.error(
    '\nThis usually means one or more .sql files under prisma/migrations/ were never run against ' +
      'this DATABASE_URL (migrations here are applied manually via psql, not `prisma migrate deploy`). ' +
      'Apply the missing migration(s) manually and re-run `npm run check:migrations` to confirm. ' +
      'Also double-check you are pointed at the DATABASE_URL the LIVE process actually uses ' +
      '(on Kids-server this is backend/.env.production, not backend/.env — Tick 48 found these can drift).',
  );

  process.exitCode = 1;
}

main().catch((err) => {
  console.error('check-migrations-applied failed:', err);
  process.exitCode = 1;
});
