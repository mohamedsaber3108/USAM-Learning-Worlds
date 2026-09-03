/**
 * Age Variant Seeding — Developmental Adaptation Engine
 *
 * ContentAdaptationService (learning/services/content-adaptation.service.ts)
 * is real, working logic that reads AgeVariant rows keyed on
 * (entityType, entityId, ageBand) — but the table was completely empty
 * (0 rows), so every call fell back to unadapted base content.
 *
 * This seeds real AgeVariant rows for the most-used ACTIVITY and
 * MISSION entities, covering all 3 age bands (AGE_8_9, AGE_10_11,
 * AGE_12_14), so the adaptation logic actually has data to serve.
 */

import { PrismaClient, AgeBand, ScaffoldLevel } from '@prisma/client';

const prisma = new PrismaClient();

interface VariantSpec {
  framing: string;
  languageLevel: string;
  scaffoldLevel: ScaffoldLevel;
  surface?: string;
}

interface EntityVariants {
  entityType: 'ACTIVITY' | 'MISSION';
  entityId: string;
  label: string; // for logging only
  variants: Record<AgeBand, VariantSpec>;
}

// 8 highest-traffic/lowest-order Activity rows + 2 Mission rows =
// 10 entities x 3 age bands = 30 AgeVariant rows.
const ENTITIES: EntityVariants[] = [
  {
    entityType: 'ACTIVITY',
    entityId: 'dcf28bc1-7e4c-4753-9836-f6ee9e87c8d8', // What is 5 + 3?
    label: 'What is 5 + 3?',
    variants: {
      AGE_8_9: {
        framing: "Let's count! If you have 5 candies and get 3 more, how many candies do you have now?",
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Count on your fingers or use the picture blocks to help you add.',
      },
      AGE_10_11: {
        framing: 'Add these two numbers together: 5 + 3.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Try picturing a number line and hopping forward 3 spaces from 5.',
      },
      AGE_12_14: {
        framing: 'Evaluate the sum: 5 + 3 = ?',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve directly; use mental math.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: '71f04cf5-8503-4841-b7b7-e369ed2a310d', // What is 7 + 4?
    label: 'What is 7 + 4?',
    variants: {
      AGE_8_9: {
        framing: 'You have 7 stickers, and a friend gives you 4 more. How many stickers in total?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Use the counting blocks shown on screen to add them up one by one.',
      },
      AGE_10_11: {
        framing: 'What is the sum of 7 and 4?',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Break 4 into 3 + 1 to make a friendly ten with 7, then add the leftover 1.',
      },
      AGE_12_14: {
        framing: 'Compute 7 + 4.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve quickly using mental math.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: '8c03c0ff-e1b4-4f71-9731-f3cdacd506db', // Solve: 9 + 6 = ?
    label: 'Solve: 9 + 6 = ?',
    variants: {
      AGE_8_9: {
        framing: 'Imagine 9 apples on a table and 6 more apples get added. How many apples now?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Draw or count 9 dots, then draw 6 more, then count them all together.',
      },
      AGE_10_11: {
        framing: 'Find the total: 9 + 6.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Try rounding 9 up to 10 (add 1), solve 10 + 6, then subtract the 1 back.',
      },
      AGE_12_14: {
        framing: 'Solve: 9 + 6 = ?',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve independently using any strategy.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: 'eb450d78-f430-495c-acdc-88079dcdbbe7', // What is 23 + 15?
    label: 'What is 23 + 15?',
    variants: {
      AGE_8_9: {
        framing: 'You have 23 marbles, and your friend gives you 15 more. How many marbles do you have altogether?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Add the tens first (20 + 10), then add the ones (3 + 5), then combine.',
      },
      AGE_10_11: {
        framing: 'Add 23 and 15 using place value.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Line up the tens and ones columns to add step by step.',
      },
      AGE_12_14: {
        framing: 'Evaluate: 23 + 15.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Compute using any efficient mental strategy.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: '8f2a7f8a-45d5-41ae-8231-883e6891f6c4', // What is 45 + 27?
    label: 'What is 45 + 27?',
    variants: {
      AGE_8_9: {
        framing: 'A shop has 45 toys, and a truck delivers 27 more. How many toys are there now?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Add the tens together, then the ones, using the number blocks shown.',
      },
      AGE_10_11: {
        framing: 'Add 45 and 27 using column addition.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Regroup: 5 + 7 = 12, carry the 1 into the tens column.',
      },
      AGE_12_14: {
        framing: 'Compute the sum of 45 and 27.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve efficiently, showing regrouping only if needed.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: '9b489f5b-d83e-4643-8f35-b880911ab1bc', // What is 3 x 4?
    label: 'What is 3 x 4?',
    variants: {
      AGE_8_9: {
        framing: 'If you have 3 bags with 4 candies in each bag, how many candies do you have altogether?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Draw 3 groups of 4 dots and count them all.',
      },
      AGE_10_11: {
        framing: 'What is the product of 3 and 4?',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Think of it as repeated addition: 4 + 4 + 4.',
      },
      AGE_12_14: {
        framing: 'Evaluate: 3 x 4.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve directly from memorized multiplication facts.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: '9615e9bb-83f8-409c-aa54-61702a99b6d2', // What is 5 x 5?
    label: 'What is 5 x 5?',
    variants: {
      AGE_8_9: {
        framing: 'You plant 5 rows of flowers with 5 flowers in each row. How many flowers in total?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Skip count by 5s: 5, 10, 15, 20, 25.',
      },
      AGE_10_11: {
        framing: 'What is 5 multiplied by 5?',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Use a 5x5 array of squares to visualize the total.',
      },
      AGE_12_14: {
        framing: 'Compute 5 x 5.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve from memory.',
      },
    },
  },
  {
    entityType: 'ACTIVITY',
    entityId: 'dd5db55e-ccec-4eac-8230-7d62ff12178f', // What is 4 x 3?
    label: 'What is 4 x 3?',
    variants: {
      AGE_8_9: {
        framing: 'You have 4 plates, and each plate has 3 cookies. How many cookies altogether?',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Count the cookies in groups of 3, four times.',
      },
      AGE_10_11: {
        framing: 'Find the product of 4 and 3.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Remember multiplication is commutative: 4x3 is the same as 3x4.',
      },
      AGE_12_14: {
        framing: 'Evaluate: 4 x 3.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Solve directly.',
      },
    },
  },
  {
    entityType: 'MISSION',
    entityId: 'a08a0612-2ece-4774-beb7-897037f518da', // Math Explorer: Addition
    label: 'Math Explorer: Addition',
    variants: {
      AGE_8_9: {
        framing: "Join Azouz on a treasure hunt where every clue is an addition puzzle! Let's count our way to the treasure.",
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Bright pictures, big numbers, and lots of encouragement along the way.',
      },
      AGE_10_11: {
        framing: 'Explore addition strategies through a series of increasingly challenging problems as you journey through Math Explorer.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Progressively harder addition problems with hints available on request.',
      },
      AGE_12_14: {
        framing: 'Work through a structured addition mission, applying place value and regrouping strategies efficiently.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Minimal scaffolding; focus on speed and accuracy.',
      },
    },
  },
  {
    entityType: 'MISSION',
    entityId: '46562298-8ddb-480c-afa3-ee19894b0826', // Multiplication Master
    label: 'Multiplication Master',
    variants: {
      AGE_8_9: {
        framing: 'Become a Multiplication Master by solving fun grouping puzzles with Azouz — count in groups to find the answer!',
        languageLevel: 'simple',
        scaffoldLevel: ScaffoldLevel.MODELLED,
        surface: 'Visual grouping (arrays, groups of objects) shown for every problem.',
      },
      AGE_10_11: {
        framing: 'Practice your multiplication facts and strategies as you work toward becoming a Multiplication Master.',
        languageLevel: 'moderate',
        scaffoldLevel: ScaffoldLevel.GUIDED,
        surface: 'Arrays and skip-counting hints available on request.',
      },
      AGE_12_14: {
        framing: 'Demonstrate fluency with multiplication facts and apply them to multi-step problems.',
        languageLevel: 'complex',
        scaffoldLevel: ScaffoldLevel.COACHED,
        surface: 'Minimal visual support; focus on fluency and application.',
      },
    },
  },
];

async function seedAgeVariants() {
  console.log('🌱 Seeding AgeVariant rows for Developmental Adaptation Engine...');

  let created = 0;
  let skipped = 0;

  for (const entity of ENTITIES) {
    for (const ageBand of Object.values(AgeBand)) {
      const spec = entity.variants[ageBand];
      if (!spec) continue;

      const existing = await prisma.ageVariant.findUnique({
        where: {
          entityType_entityId_ageBand: {
            entityType: entity.entityType,
            entityId: entity.entityId,
            ageBand,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.ageVariant.create({
        data: {
          entityType: entity.entityType,
          entityId: entity.entityId,
          ageBand,
          framing: spec.framing,
          languageLevel: spec.languageLevel,
          scaffoldLevel: spec.scaffoldLevel,
          surface: spec.surface,
        },
      });
      created++;
      console.log(`  ✅ ${entity.entityType} "${entity.label}" [${ageBand}]`);
    }
  }

  console.log(`\n📊 AgeVariant seeding summary: ${created} created, ${skipped} already existed.`);
  const total = await prisma.ageVariant.count();
  console.log(`📈 Total AgeVariant rows in DB now: ${total}`);
}

seedAgeVariants()
  .catch((e) => {
    console.error('❌ AgeVariant seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
