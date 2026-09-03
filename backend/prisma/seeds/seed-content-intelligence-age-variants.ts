/**
 * Content Intelligence Engine seeding
 *
 * Seeds real ContentItem rows plus real AgeVariant rows so
 * content-adaptation.service.ts actually has data to read for
 * entityType ACTIVITY and CONTENT_ITEM (both age_variants and
 * content_items were empty in production before this tick — the
 * adaptation code path existed but had nothing to adapt).
 */

import { PrismaClient, AgeBand, ScaffoldLevel, ContentType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Pick a few real, already-seeded activities to attach age variants to.
  const activities = await prisma.activity.findMany({
    where: { isActive: true },
    take: 3,
    orderBy: { order: 'asc' },
  });

  for (const activity of activities) {
    const variants: Array<{
      ageBand: AgeBand;
      framing: string;
      languageLevel: string;
      scaffoldLevel: ScaffoldLevel;
      surface: string;
    }> = [
      {
        ageBand: AgeBand.AGE_8_9,
        framing: `Let's play with numbers! ${activity.title}`,
        languageLevel: 'basic',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Short sentences, a friendly character walks you through it step by step.',
      },
      {
        ageBand: AgeBand.AGE_10_11,
        framing: `Time to solve: ${activity.title}`,
        languageLevel: 'intermediate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Clear instructions with a hint available if you get stuck.',
      },
      {
        ageBand: AgeBand.AGE_12_14,
        framing: `Challenge: ${activity.title}`,
        languageLevel: 'advanced',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Direct prompt, minimal hand-holding, hints only on request.',
      },
    ];

    for (const v of variants) {
      await prisma.ageVariant.upsert({
        where: {
          entityType_entityId_ageBand: {
            entityType: 'ACTIVITY',
            entityId: activity.id,
            ageBand: v.ageBand,
          },
        },
        update: {
          framing: v.framing,
          languageLevel: v.languageLevel,
          scaffoldLevel: v.scaffoldLevel,
          surface: v.surface,
        },
        create: {
          entityType: 'ACTIVITY',
          entityId: activity.id,
          ageBand: v.ageBand,
          framing: v.framing,
          languageLevel: v.languageLevel,
          scaffoldLevel: v.scaffoldLevel,
          surface: v.surface,
        },
      });
    }
  }

  // Seed a couple of real ContentItem rows (previously zero rows existed)
  // plus their own age variants, exercising the CONTENT_ITEM path added to
  // content-adaptation.service.ts this tick.
  const domain = await prisma.domain.findFirst({ where: { isActive: true } });

  const contentItem = await prisma.contentItem.upsert({
    where: { id: 'seed-content-item-place-value-explainer' },
    update: {},
    create: {
      id: 'seed-content-item-place-value-explainer',
      type: ContentType.EXPLANATION,
      title: 'Place Value Explainer',
      content: {
        body: 'Every digit in a number has a place value — ones, tens, hundreds — based on where it sits.',
      },
      language: 'en',
      domainId: domain?.id,
      status: ContentStatus.PUBLISHED,
      generatedBy: 'seed-content-intelligence',
    },
  });

  await prisma.ageVariant.upsert({
    where: {
      entityType_entityId_ageBand: {
        entityType: 'CONTENT_ITEM',
        entityId: contentItem.id,
        ageBand: AgeBand.AGE_8_9,
      },
    },
    update: {},
    create: {
      entityType: 'CONTENT_ITEM',
      entityId: contentItem.id,
      ageBand: AgeBand.AGE_8_9,
      framing: 'Numbers have secret hiding spots called place values!',
      languageLevel: 'basic',
      scaffoldLevel: ScaffoldLevel.MODELLED,
      surface: 'Uses a visual place-value chart with colored blocks.',
    },
  });

  await prisma.ageVariant.upsert({
    where: {
      entityType_entityId_ageBand: {
        entityType: 'CONTENT_ITEM',
        entityId: contentItem.id,
        ageBand: AgeBand.AGE_12_14,
      },
    },
    update: {},
    create: {
      entityType: 'CONTENT_ITEM',
      entityId: contentItem.id,
      ageBand: AgeBand.AGE_12_14,
      framing: 'Place value is the positional-notation system underlying base-10 arithmetic.',
      languageLevel: 'advanced',
      scaffoldLevel: ScaffoldLevel.COACHED,
      surface: 'Direct technical explanation, no visual aids required.',
    },
  });

  console.log(`Seeded age variants for ${activities.length} activities + 1 ContentItem (2 age variants).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
