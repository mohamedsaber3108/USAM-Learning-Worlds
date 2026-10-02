/**
 * One-off data-repair script: links existing Mission rows to their World
 * by domain, via each mission's own id-prefix naming convention
 * (english-mission-*, coding-mission-*, ai-mission-*,
 * entrepreneurship-mission-*, coding-sandbox-demo-mission,
 * coding-concepts-practice-mission). Confirmed via a direct production
 * API read (2026-10-02) that seeding World rows alone does NOT retroactively
 * set worldId on missions created before Worlds existed -- every one of the
 * 29 real production missions had worldId: null, so WorldDetailPage/
 * LearnPage's "My worlds" correctly showed empty even after World rows
 * were seeded. This script closes that gap.
 *
 * Idempotent: only ever sets worldId where it is currently null and the
 * mission id matches a known prefix; running it twice is a no-op the
 * second time. Does not touch mission title/description/content.
 *
 * Usage: npx ts-node -r tsconfig-paths/register prisma/seeds/seed-link-missions-to-worlds.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREFIX_TO_WORLD_SLUG: Array<{ prefix: string; worldSlug: string }> = [
  { prefix: 'english-mission-', worldSlug: 'wordhaven' },
  { prefix: 'coding-mission-', worldSlug: 'circuit-city' },
  { prefix: 'coding-sandbox-demo-mission', worldSlug: 'circuit-city' },
  { prefix: 'coding-concepts-practice-mission', worldSlug: 'circuit-city' },
  { prefix: 'ai-mission-', worldSlug: 'mindspring' },
  { prefix: 'entrepreneurship-mission-', worldSlug: 'launch-bay' },
  { prefix: 'creativity-mission-', worldSlug: 'wordhaven' }, // Creativity has no dedicated World; grouped with Wordhaven (English) same as the frontend's existing fallback icon mapping.
];

async function main() {
  const worlds = await prisma.world.findMany();
  const worldBySlug = new Map(worlds.map((w) => [w.slug, w.id]));

  const missions = await prisma.mission.findMany({ where: { worldId: null } });
  console.log(`Found ${missions.length} missions with no worldId.`);

  let linked = 0;
  let unmatched = 0;
  for (const m of missions) {
    const match = PREFIX_TO_WORLD_SLUG.find((p) => m.id.startsWith(p.prefix));
    if (!match) {
      console.log(`  - no prefix match: ${m.id} (${m.title})`);
      unmatched++;
      continue;
    }
    const worldId = worldBySlug.get(match.worldSlug);
    if (!worldId) {
      console.log(`  - world slug '${match.worldSlug}' not found for mission ${m.id}`);
      unmatched++;
      continue;
    }
    await prisma.mission.update({ where: { id: m.id }, data: { worldId } });
    linked++;
  }

  console.log(`Linked ${linked} missions to worlds. ${unmatched} unmatched (left as-is, not an error).`);

  const counts = await prisma.world.findMany({
    include: { _count: { select: { missions: true } } },
  });
  for (const w of counts) {
    console.log(`  ${w.name} (${w.slug}): ${w._count.missions} missions`);
  }
}

main()
  .catch((e) => {
    console.error('Mission-to-world linking failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
