/**
 * Learning Paths Seeding
 *
 * Seeds real, domain-aligned learning paths for the ages this platform
 * targets (8-14), each with an ordered sequence of nodes pointing at
 * real Skill/Competency/Activity entities already in the DB.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Learning Paths...\n');

  const domains = await prisma.domain.findMany();
  const bySlug = (slug: string) => domains.find((d) => d.slug === slug);

  const pathDefs = [
    {
      domainSlug: 'mathematics',
      name: 'Number Sense Foundations',
      slug: 'number-sense-foundations',
      description: 'Build a solid foundation in place value and single/double digit addition',
      ageBand: 'AGE_8_9' as const,
      skillSlugs: ['number-sense', 'addition-subtraction'],
    },
    {
      domainSlug: 'mathematics',
      name: 'Multiplication Mastery',
      slug: 'multiplication-mastery',
      description: 'Progress from repeated addition to fluent times tables 1-12',
      ageBand: 'AGE_10_11' as const,
      skillSlugs: ['multiplication'],
    },
    {
      domainSlug: 'science',
      name: 'Plant Explorer',
      slug: 'plant-explorer',
      description: 'Discover how plants grow, from seed to bloom',
      ageBand: 'AGE_8_9' as const,
      skillSlugs: ['plants-nature'],
    },
    {
      domainSlug: 'science',
      name: 'Journey Through the Solar System',
      slug: 'journey-through-the-solar-system',
      description: 'Explore the planets, from the rocky inner worlds to the icy giants',
      ageBand: 'AGE_10_11' as const,
      skillSlugs: ['solar-system'],
    },
    {
      domainSlug: 'language',
      name: 'Word Power Starter',
      slug: 'word-power-starter',
      description: 'Grow your vocabulary and learn to spot synonyms and antonyms',
      ageBand: 'AGE_8_9' as const,
      skillSlugs: ['vocabulary', 'reading-comprehension'],
    },
    {
      domainSlug: 'technology',
      name: 'Block Coding Basics',
      slug: 'block-coding-basics',
      description: 'Learn sequencing and loops through visual block programming',
      ageBand: 'AGE_10_11' as const,
      skillSlugs: ['block-coding'],
    },
  ];

  let pathsCreated = 0;
  let pathsUpdated = 0;
  let nodesCreated = 0;

  for (const def of pathDefs) {
    const domain = bySlug(def.domainSlug);
    if (!domain) {
      console.log(`⚠️  Domain "${def.domainSlug}" not found - skipping path "${def.name}"`);
      continue;
    }

    const existing = await prisma.learningPath.findUnique({ where: { slug: def.slug } });
    const data = {
      domainId: domain.id,
      name: def.name,
      slug: def.slug,
      description: def.description,
      ageBand: def.ageBand,
      order: pathsCreated + pathsUpdated + 1,
      isActive: true,
    };
    let path;
    if (existing) {
      path = await prisma.learningPath.update({ where: { id: existing.id }, data });
      pathsUpdated++;
    } else {
      path = await prisma.learningPath.create({ data });
      pathsCreated++;
    }
    console.log(`✅ Path: ${def.name} (${def.ageBand})`);

    // Build nodes from the skills' competencies -> concepts, in order.
    let order = 0;
    for (const skillSlug of def.skillSlugs) {
      const skill = await prisma.skill.findUnique({
        where: { slug: skillSlug },
        include: { competencies: { include: { concepts: true }, orderBy: { order: 'asc' } } },
      });
      if (!skill) continue;

      // Node for the skill itself
      const existingSkillNode = await prisma.learningPathNode.findFirst({
        where: { pathId: path.id, entityType: 'SKILL', entityId: skill.id },
      });
      if (existingSkillNode) {
        await prisma.learningPathNode.update({ where: { id: existingSkillNode.id }, data: { order } });
      } else {
        await prisma.learningPathNode.create({
          data: { pathId: path.id, entityType: 'SKILL', entityId: skill.id, order, isOptional: false },
        });
        nodesCreated++;
      }
      order++;

      for (const comp of skill.competencies) {
        for (const concept of comp.concepts) {
          const existingNode = await prisma.learningPathNode.findFirst({
            where: { pathId: path.id, entityType: 'CONCEPT', entityId: concept.id },
          });
          if (existingNode) {
            await prisma.learningPathNode.update({ where: { id: existingNode.id }, data: { order: order++ } });
          } else {
            await prisma.learningPathNode.create({
              data: { pathId: path.id, entityType: 'CONCEPT', entityId: concept.id, order: order++, isOptional: false },
            });
            nodesCreated++;
          }
        }
      }
    }
    console.log(`   -> ${order} nodes`);
  }

  console.log(`\n📊 Summary: paths created ${pathsCreated}, updated ${pathsUpdated}, total nodes touched ${nodesCreated}`);
  console.log('\n🎉 Learning paths seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Learning paths seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
