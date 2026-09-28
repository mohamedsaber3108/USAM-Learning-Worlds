/**
 * Enum drift safety net (audit 71).
 *
 * WHY THIS EXISTS:
 * The SubscriptionStatus incident: a field was declared as a Prisma `enum`, so
 * the generated client casts query values to a Postgres enum type
 * (`public.SubscriptionStatus`) — but the migration created the column as plain
 * TEXT and never created that enum type. Result: EVERY query on that path 500'd
 * with `type "public.SubscriptionStatus" does not exist`, which took down all
 * mission starts in production. The migration-drift checker (tables/columns)
 * cannot catch this — it is a TYPE-level mismatch.
 *
 * WHAT THIS SCRIPT DOES (read-only / diagnostic):
 *   1. Reads every `enum` declared in the Prisma schema (via the generated
 *      client's DMMF) → the set of enums + values the CLIENT expects.
 *   2. Queries pg_type/pg_enum on the live DATABASE_URL for every enum TYPE that
 *      actually exists and its value list.
 *   3. Reports, with a non-zero exit code:
 *        - MISSING TYPE: a Prisma enum whose Postgres type does not exist
 *          (the SubscriptionStatus bug class — will 500 at query time).
 *        - VALUE DRIFT: a Prisma enum whose values differ from the DB type
 *          (missing/extra/renamed values — inserts/reads of the divergent
 *          value will fail).
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - It does not check whether each COLUMN uses the enum type vs TEXT (a column
 *     can be TEXT while the type exists — a softer drift). That requires a
 *     column-by-column map; this checks the higher-signal type existence + values.
 *   - It does not modify anything.
 *
 * HOW TO RUN:
 *   cd backend
 *   npm run check:enum-drift
 *
 * Requires DATABASE_URL (read the same way Prisma does, via backend/.env or env).
 * Run it in the deploy pipeline BEFORE flipping traffic, so a schema/DB enum
 * mismatch is caught at deploy time instead of at the first query in production.
 */

import { PrismaClient, Prisma } from '@prisma/client';

interface PrismaEnum {
  name: string;
  values: string[];
}

/** All enums the generated Prisma client knows about, from the DMMF. */
function getPrismaEnums(): PrismaEnum[] {
  const dmmf: any = (Prisma as any).dmmf;
  const enums = dmmf?.datamodel?.enums ?? [];
  return enums.map((e: any) => ({
    name: e.name,
    values: e.values.map((v: any) => v.name).sort(),
  }));
}

/** Every enum TYPE that exists in the live DB, with its value list. */
async function getDbEnums(prisma: PrismaClient): Promise<Map<string, string[]>> {
  const rows = await prisma.$queryRawUnsafe<{ typname: string; enumlabel: string }[]>(
    `SELECT t.typname, e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON e.enumtypid = t.oid
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = 'public'
     ORDER BY t.typname, e.enumsortorder`,
  );
  const map = new Map<string, string[]>();
  for (const r of rows) {
    if (!map.has(r.typname)) map.set(r.typname, []);
    map.get(r.typname)!.push(r.enumlabel);
  }
  for (const [k, v] of map) map.set(k, v.sort());
  return map;
}

function sameValues(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => x === b[i]);
}

async function main() {
  const prismaEnums = getPrismaEnums();
  if (prismaEnums.length === 0) {
    console.log('No Prisma enums found in the DMMF. Nothing to check.');
    return;
  }
  console.log(`Prisma schema declares ${prismaEnums.length} enum type(s).`);

  const prisma = new PrismaClient();
  let dbEnums: Map<string, string[]>;
  try {
    dbEnums = await getDbEnums(prisma);
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Live DB has ${dbEnums.size} enum type(s) in schema "public".`);

  const missingType: PrismaEnum[] = [];
  const valueDrift: { name: string; prisma: string[]; db: string[] }[] = [];

  for (const pe of prismaEnums) {
    const dbVals = dbEnums.get(pe.name);
    if (!dbVals) {
      missingType.push(pe);
      continue;
    }
    if (!sameValues(pe.values, dbVals)) {
      valueDrift.push({ name: pe.name, prisma: pe.values, db: dbVals });
    }
  }

  if (missingType.length === 0 && valueDrift.length === 0) {
    console.log(
      '\n✅ Every Prisma enum has a matching Postgres enum type with identical values. No enum drift.',
    );
    return;
  }

  if (missingType.length > 0) {
    console.error(
      `\n❌ ENUM DRIFT (MISSING TYPE): ${missingType.length} Prisma enum(s) have NO Postgres type ` +
        `— queries casting to them will 500 (the SubscriptionStatus bug class):\n`,
    );
    for (const m of missingType) {
      console.error(`  - "${m.name}"  expected values: [${m.values.join(', ')}]`);
    }
    console.error(
      '\nFix: either create the enum type + convert the column (if the field is a ' +
        'real enum), or change the Prisma field to String (if the column is ' +
        'intentionally TEXT). See plans-local/71_SCHEMA_ENUM_DRIFT_AUDIT.md.',
    );
  }

  if (valueDrift.length > 0) {
    console.error(
      `\n❌ ENUM DRIFT (VALUE MISMATCH): ${valueDrift.length} enum(s) differ between Prisma and the DB:\n`,
    );
    for (const d of valueDrift) {
      const onlyPrisma = d.prisma.filter((v) => !d.db.includes(v));
      const onlyDb = d.db.filter((v) => !d.prisma.includes(v));
      console.error(`  - "${d.name}"`);
      if (onlyPrisma.length) console.error(`      only in Prisma: [${onlyPrisma.join(', ')}]`);
      if (onlyDb.length) console.error(`      only in DB:     [${onlyDb.join(', ')}]`);
    }
    console.error('\nFix: ALTER TYPE ... ADD VALUE (DB) or update the Prisma enum to match.');
  }

  process.exitCode = 1;
}

main().catch((err) => {
  console.error('check-enum-drift failed:', err);
  process.exitCode = 1;
});
