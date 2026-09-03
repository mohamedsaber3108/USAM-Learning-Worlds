/**
 * Content Intelligence Engine — core ContentItem seeding, real curriculum content
 * -------------------------------------------------------------------------------
 * The `content_items` table (ContentItem model) had exactly 1 row in production
 * (a single demo EXPLANATION seeded by seed-content-intelligence-age-variants.ts)
 * against 13 real LearningObjective rows spanning 5 domains (mathematics, science,
 * language, technology, coding-sandbox-demo). This script seeds real, curriculum-
 * aligned EXPLANATION + PRACTICE_SET content for every one of the 13 objectives
 * that don't yet have a real content item, plus age-band variants (AgeVariant)
 * for each new item so the Content Intelligence / Age-Adaptation engine actually
 * has adaptable content for every learning objective, not just a demo of one.
 *
 * Idempotent: upserts by deterministic `id` (seed-content-<objectiveSlug>-<type>),
 * safe to re-run.
 *
 * Run with:
 *   npx ts-node prisma/seeds/seed-content-items-core.ts
 */

import {
  PrismaClient,
  ContentType,
  ContentStatus,
  DifficultyLevel,
  AgeBand,
  ScaffoldLevel,
} from '@prisma/client';

const prisma = new PrismaClient();

interface ObjectiveContentSeed {
  objectiveName: string; // must match LearningObjective.name exactly
  slug: string; // for deterministic ids
  explanation: { body: string; example?: string };
  practice: { prompt: string; hint: string; solutionNote: string };
  difficulty: DifficultyLevel;
  ageVariants: {
    ageBand: AgeBand;
    framing: string;
    languageLevel: string;
    scaffoldLevel: ScaffoldLevel;
    surface: string;
  }[];
}

const OBJECTIVE_CONTENT: ObjectiveContentSeed[] = [
  {
    objectiveName: 'Identify place value in 3-digit numbers',
    slug: 'place-value-3digit',
    explanation: {
      body: 'Every digit in a number has a place value — ones, tens, hundreds — based on where it sits. In 425, the 4 is in the hundreds place (worth 400), the 2 is in the tens place (worth 20), and the 5 is in the ones place (worth 5).',
      example: '425 = 400 + 20 + 5',
    },
    practice: {
      prompt: 'What is the value of the digit 7 in the number 738?',
      hint: 'Count the places from the right: ones, tens, hundreds.',
      solutionNote: '7 is in the hundreds place, so its value is 700.',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Numbers have secret hiding spots called place values!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Visual place-value chart with colored blocks.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Break big numbers into hundreds, tens, and ones.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Number-expansion practice with a hint button.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Positional notation in base-10 arithmetic.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Direct technical explanation, minimal scaffolding.' },
    ],
  },
  {
    objectiveName: 'Master Single Digit Addition',
    slug: 'single-digit-addition',
    explanation: {
      body: 'Adding two single-digit numbers means combining two small groups into one bigger group and counting the total. 4 + 3 means 4 things plus 3 more things, giving 7 things altogether.',
      example: '4 + 3 = 7',
    },
    practice: {
      prompt: 'What is 6 + 5?',
      hint: 'Start at 6 and count up 5 more: 7, 8, 9, 10, 11.',
      solutionNote: '6 + 5 = 11',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: "Let's put our counting fingers to work!", languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Counter animation with objects to combine.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Quick mental-math addition drill.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Timed drill with a number-line hint.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Speed-check: single-digit addition fluency.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Rapid-fire quiz, no visual aids.' },
    ],
  },
  {
    objectiveName: 'Master Double Digit Addition',
    slug: 'double-digit-addition',
    explanation: {
      body: 'To add two-digit numbers, add the ones column first, then the tens column. If the ones add up to 10 or more, carry the extra ten into the tens column.',
      example: '27 + 15: ones 7+5=12 (write 2, carry 1); tens 2+1+1=4 → 42',
    },
    practice: {
      prompt: 'What is 38 + 46?',
      hint: 'Add the ones (8+6=14, carry 1), then the tens (3+4+1=8).',
      solutionNote: '38 + 46 = 84',
    },
    difficulty: DifficultyLevel.MEDIUM,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Stack the numbers and add column by column!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Vertical column addition with carry-the-one animation.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Two-digit addition with carrying practice.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Column method with optional hint reveal.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Regrouping in double-digit addition.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Mental-math strategy discussion, minimal scaffolding.' },
    ],
  },
  {
    objectiveName: 'Master Times Tables 1-5',
    slug: 'times-tables-1-5',
    explanation: {
      body: 'Multiplication is repeated addition. 3 × 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12. Learning the 1-5 times tables by heart makes later math much faster.',
      example: '3 × 4 = 3 + 3 + 3 + 3 = 12',
    },
    practice: {
      prompt: 'What is 4 × 5?',
      hint: 'Add 4 five times, or think of 5 groups of 4.',
      solutionNote: '4 × 5 = 20',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Groups of things make multiplication easy!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Array-of-dots visual with grouping animation.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Times tables 1-5 speed practice.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Flashcard-style drill with a skip-count hint.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Multiplication fluency check, 1-5 range.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Rapid quiz, answer-only format.' },
    ],
  },
  {
    objectiveName: 'Master Times Tables 6-12',
    slug: 'times-tables-6-12',
    explanation: {
      body: 'The 6-12 times tables build on what you already know. You can find 7 × 8 by using 7 × 7 = 49 and adding one more 7 (49 + 7 = 56), or by breaking 8 into 4+4 and doubling.',
      example: '7 × 8 = (7 × 4) × 2 = 28 × 2 = 56',
    },
    practice: {
      prompt: 'What is 9 × 7?',
      hint: 'Use 10 × 7 = 70, then subtract one 7: 70 - 7.',
      solutionNote: '9 × 7 = 63',
    },
    difficulty: DifficultyLevel.MEDIUM,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Bigger groups, bigger multiplying adventures!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Step-by-step breakdown with visual grouping.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Times tables 6-12 strategy practice.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Trick-based hints (near-10 strategy) available.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Multiplication fluency, extended range.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Timed fluency check, minimal hand-holding.' },
    ],
  },
  {
    objectiveName: 'Master Parts of a Plant',
    slug: 'parts-of-a-plant',
    explanation: {
      body: 'Plants have roots (absorb water and nutrients from soil), a stem (supports the plant and carries water up), leaves (make food using sunlight, called photosynthesis), and flowers (help the plant reproduce and make seeds).',
      example: 'Root → Stem → Leaf → Flower, each with its own job.',
    },
    practice: {
      prompt: 'Which part of the plant absorbs water from the soil?',
      hint: 'Think about what is underground.',
      solutionNote: 'The roots absorb water and nutrients from the soil.',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Meet the amazing parts of a plant!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Labeled diagram with tap-to-reveal facts.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Plant anatomy and each part\'s function.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Diagram plus short function descriptions.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Plant structures and physiological roles.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Text-based explanation referencing photosynthesis.' },
    ],
  },
  {
    objectiveName: 'Master Plant Life Cycle',
    slug: 'plant-life-cycle',
    explanation: {
      body: 'A plant\'s life cycle starts with a seed. The seed germinates (sprouts) into a seedling, grows into a mature plant, produces flowers, and those flowers make new seeds — starting the cycle again.',
      example: 'Seed → Seedling → Mature plant → Flower → New seeds',
    },
    practice: {
      prompt: 'What happens right after a seed germinates?',
      hint: 'Think about the very first stage of growth after sprouting.',
      solutionNote: 'It becomes a seedling — a young, small plant.',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Watch a tiny seed grow into a big plant!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Animated growth timeline with characters.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'The stages of a plant\'s life cycle.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Cycle diagram with stage labels.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Germination through reproduction in plants.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Concise text summary of the full cycle.' },
    ],
  },
  {
    objectiveName: 'Master Planet Names & Order',
    slug: 'planet-names-order',
    explanation: {
      body: 'The eight planets, in order from the Sun, are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. A memory trick: "My Very Educated Mother Just Served Us Nachos."',
      example: 'Mercury (closest) → ... → Neptune (farthest)',
    },
    practice: {
      prompt: 'Which planet is fourth from the Sun?',
      hint: 'Count: Mercury (1), Venus (2), Earth (3), then...',
      solutionNote: 'Mars is the fourth planet from the Sun.',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Blast off on a tour of the planets!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Animated solar-system flyby with planet facts.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Memorize the planets in order from the Sun.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Mnemonic-based practice with a drag-to-order activity.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Solar system structure and planetary order.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Direct fact list, quiz-style check.' },
    ],
  },
  {
    objectiveName: 'Master Common Words',
    slug: 'common-words',
    explanation: {
      body: 'Common words (also called "sight words") like "the", "and", "was", and "said" appear so often in reading that recognizing them instantly, without sounding them out, makes reading much faster and smoother.',
      example: '"the", "and", "said", "was", "they"',
    },
    practice: {
      prompt: 'Which of these is a common sight word: "the" or "elephant"?',
      hint: 'Think about which word you see in almost every sentence.',
      solutionNote: '"the" is a common sight word — it appears in nearly every sentence.',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Spot the words you see everywhere!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Flashcards with instant-read practice.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Sight-word recognition speed round.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Timed word-spotting game in short passages.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'High-frequency word fluency check.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Reading-passage-embedded quiz.' },
    ],
  },
  {
    objectiveName: 'Master Synonyms & Antonyms',
    slug: 'synonyms-antonyms',
    explanation: {
      body: 'A synonym is a word that means almost the same thing as another word (happy / glad). An antonym is a word that means the opposite (happy / sad). Learning both helps you write with more variety and understand text better.',
      example: 'Synonym: big → large. Antonym: big → small.',
    },
    practice: {
      prompt: 'What is an antonym for "hot"?',
      hint: 'Think of the opposite temperature.',
      solutionNote: '"cold" is an antonym for "hot".',
    },
    difficulty: DifficultyLevel.MEDIUM,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Words that are twins and words that are opposites!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Picture-matching game for synonym/antonym pairs.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Build your synonym and antonym vocabulary.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Word-pair matching with a thesaurus hint.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Precision word choice: synonyms vs antonyms.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Context-based fill-in-the-blank exercise.' },
    ],
  },
  {
    objectiveName: 'Master Sequences',
    slug: 'coding-sequences',
    explanation: {
      body: 'In coding, a sequence is a set of instructions that run one after another, in order. Just like a recipe — you crack the eggs before you scramble them, not after. Computers follow sequences exactly as written.',
      example: 'Step 1: Move forward. Step 2: Turn right. Step 3: Move forward.',
    },
    practice: {
      prompt: 'To draw a square, which comes first: "turn right" four times, or "move forward, then turn right" repeated four times?',
      hint: 'Think about what happens if you only turn without ever moving.',
      solutionNote: 'You need "move forward, then turn right" repeated — turning alone never draws any lines.',
    },
    difficulty: DifficultyLevel.EASY,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Give your robot friend step-by-step directions!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Drag-and-drop block sequence with a walking character.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Order matters: building instruction sequences.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Block-based sequencing puzzle with hint arrows.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Sequential execution in program logic.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Pseudocode sequence-tracing exercise.' },
    ],
  },
  {
    objectiveName: 'Master Loops',
    slug: 'coding-loops',
    explanation: {
      body: 'A loop lets a computer repeat the same instructions multiple times without you writing them out over and over. Instead of writing "move forward" four times to draw a square side, a loop says "repeat 4 times: move forward, turn right".',
      example: 'repeat 4 times { move forward; turn right }',
    },
    practice: {
      prompt: 'You want a character to jump 10 times. Should you write "jump" 10 separate times, or use a loop?',
      hint: 'Which is shorter and easier to change later if you want 20 jumps instead?',
      solutionNote: 'Use a loop: "repeat 10 times { jump }" — shorter, and easy to change to any number.',
    },
    difficulty: DifficultyLevel.MEDIUM,
    ageVariants: [
      { ageBand: AgeBand.AGE_8_9, framing: 'Make your character repeat a trick without extra work!', languageLevel: 'basic', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Loop block with a repeat-count dial and live animation.' },
      { ageBand: AgeBand.AGE_10_11, framing: 'Loops: repeating instructions efficiently.', languageLevel: 'intermediate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Block-based loop puzzle with a step counter.' },
      { ageBand: AgeBand.AGE_12_14, framing: 'Iteration and loop control in programs.', languageLevel: 'advanced', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Code-trace exercise showing loop-variable state.' },
    ],
  },
];

async function main() {
  let createdItems = 0;
  let createdVariants = 0;

  for (const seed of OBJECTIVE_CONTENT) {
    const objective = await prisma.learningObjective.findFirst({
      where: { name: seed.objectiveName },
      include: { competency: { include: { skill: { include: { domain: true } } } } },
    });

    if (!objective) {
      console.warn(`SKIP: LearningObjective not found for "${seed.objectiveName}"`);
      continue;
    }

    const domainId = objective.competency.skill.domain.id;

    // EXPLANATION content item
    const explanationId = `seed-content-${seed.slug}-explanation`;
    const explanationItem = await prisma.contentItem.upsert({
      where: { id: explanationId },
      update: {
        content: seed.explanation,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        id: explanationId,
        type: ContentType.EXPLANATION,
        title: `${seed.objectiveName} — Explanation`,
        content: seed.explanation,
        language: 'en',
        domainId,
        objectiveId: objective.id,
        difficulty: seed.difficulty,
        status: ContentStatus.PUBLISHED,
        generatedBy: 'seed-content-items-core',
      },
    });
    createdItems++;

    // PRACTICE_SET content item
    const practiceId = `seed-content-${seed.slug}-practice`;
    const practiceItem = await prisma.contentItem.upsert({
      where: { id: practiceId },
      update: {
        content: seed.practice,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        id: practiceId,
        type: ContentType.PRACTICE_SET,
        title: `${seed.objectiveName} — Practice`,
        content: seed.practice,
        language: 'en',
        domainId,
        objectiveId: objective.id,
        difficulty: seed.difficulty,
        status: ContentStatus.PUBLISHED,
        generatedBy: 'seed-content-items-core',
      },
    });
    createdItems++;

    // Age variants for the explanation item (the one most likely to be read verbatim)
    for (const v of seed.ageVariants) {
      await prisma.ageVariant.upsert({
        where: {
          entityType_entityId_ageBand: {
            entityType: 'CONTENT_ITEM',
            entityId: explanationItem.id,
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
          entityType: 'CONTENT_ITEM',
          entityId: explanationItem.id,
          ageBand: v.ageBand,
          framing: v.framing,
          languageLevel: v.languageLevel,
          scaffoldLevel: v.scaffoldLevel,
          surface: v.surface,
        },
      });
      createdVariants++;
    }

    console.log(`Seeded: ${seed.objectiveName} -> ${explanationId}, ${practiceId} (+${seed.ageVariants.length} age variants)`);
  }

  console.log(`\nDone. ContentItems upserted: ${createdItems}. AgeVariants upserted: ${createdVariants}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
