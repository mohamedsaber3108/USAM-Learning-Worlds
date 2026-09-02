/**
 * Seed: Knowledge Graph Concepts, Prerequisites & Learning Paths
 * ----------------------------------------------------------------
 * Populates the Phase-4 knowledge-graph tables (Concept, ConceptPrerequisite,
 * CompetencyPrerequisite, LearningPath, LearningPathNode) with real,
 * age-appropriate (ages 8-14) curriculum content for the domains/skills/
 * competencies that already exist in the database.
 *
 * Idempotent: safe to re-run. Concepts and LearningPaths are upserted by
 * their unique `slug`. Prerequisite edges and path nodes are only inserted
 * if they don't already exist (checked before create), so re-running this
 * script will not create duplicates or duplicate edges.
 *
 * Run with:
 *   npx ts-node prisma/seeds/seed-concepts-and-paths.ts
 */

import { PrismaClient, PrerequisiteType, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConceptSeed {
  slug: string;
  name: string;
  description: string;
  order: number;
  /** slugs of concepts (within the same competency-graph) this depends on */
  prerequisites?: string[];
}

interface CompetencySeed {
  domain: string;
  skill: string;
  competency: string;
  /** New concepts to add on top of whatever already exists for this competency */
  concepts: ConceptSeed[];
}

interface CompetencyPrereqSeed {
  domain: string;
  skill: string;
  competency: string;
  prereqDomain: string;
  prereqSkill: string;
  prereqCompetency: string;
}

interface LearningPathSeed {
  domain: string;
  slug: string;
  name: string;
  description: string;
  ageBand: AgeBand;
  order: number;
  /** concept slugs in the order a learner should encounter them */
  conceptSlugs: string[];
}

// ---------------------------------------------------------------------------
// Curriculum content
// ---------------------------------------------------------------------------

const COMPETENCY_CONCEPTS: CompetencySeed[] = [
  // ---------------- LANGUAGE ----------------
  {
    domain: 'Language',
    skill: 'Vocabulary',
    competency: 'Common Words',
    concepts: [
      {
        slug: 'compound-words',
        name: 'Compound Words',
        description:
          'Understanding how two small words combine to form a new word with its own meaning (e.g. "sun" + "flower" = "sunflower").',
        order: 10,
        prerequisites: ['everyday-vocabulary'],
      },
      {
        slug: 'homophones',
        name: 'Homophones',
        description:
          'Recognizing words that sound the same but have different spellings and meanings (e.g. "there", "their", "they\'re").',
        order: 11,
        prerequisites: ['compound-words'],
      },
      {
        slug: 'root-words-and-suffixes',
        name: 'Root Words and Suffixes',
        description:
          'Breaking words into a root and an ending (like "-ful", "-less", "-ing") to figure out meaning and build new words.',
        order: 12,
        prerequisites: ['homophones'],
      },
      {
        slug: 'context-clues-for-meaning',
        name: 'Context Clues for Meaning',
        description:
          'Using the surrounding sentence and story to figure out what an unfamiliar word probably means.',
        order: 13,
        prerequisites: ['root-words-and-suffixes'],
      },
    ],
  },
  {
    domain: 'Language',
    skill: 'Vocabulary',
    competency: 'Synonyms & Antonyms',
    concepts: [
      {
        slug: 'shades-of-meaning',
        name: 'Shades of Meaning',
        description:
          'Comparing near-synonyms (e.g. "happy", "glad", "thrilled") to see how intensity and tone differ.',
        order: 10,
        prerequisites: ['synonyms'],
      },
      {
        slug: 'analogies',
        name: 'Analogies',
        description:
          'Completing word relationships like "hot is to cold as day is to ___" using synonym/antonym logic.',
        order: 11,
        prerequisites: ['shades-of-meaning', 'antonyms'],
      },
      {
        slug: 'idioms-and-figurative-language',
        name: 'Idioms and Figurative Language',
        description:
          'Understanding common expressions whose meaning is different from the literal words (e.g. "raining cats and dogs").',
        order: 12,
        prerequisites: ['analogies'],
      },
      {
        slug: 'precise-word-choice-in-writing',
        name: 'Precise Word Choice in Writing',
        description:
          'Choosing the most exact synonym to make a sentence clearer or more vivid when writing.',
        order: 13,
        prerequisites: ['idioms-and-figurative-language'],
      },
    ],
  },

  // ---------------- MATHEMATICS ----------------
  {
    domain: 'Mathematics',
    skill: 'Addition & Subtraction',
    competency: 'Single Digit Addition',
    concepts: [
      {
        slug: 'doubles-facts',
        name: 'Doubles Facts',
        description:
          'Memorizing and using "doubles" (e.g. 4+4, 6+6) as quick mental-math anchors for other addition facts.',
        order: 10,
        prerequisites: ['counting-on'],
      },
      {
        slug: 'fact-families-addition-subtraction',
        name: 'Fact Families (Addition & Subtraction)',
        description:
          'Seeing how one addition fact (3+4=7) connects to two related subtraction facts (7-3=4, 7-4=3).',
        order: 11,
        prerequisites: ['doubles-facts', 'making-ten'],
      },
      {
        slug: 'single-digit-subtraction',
        name: 'Single Digit Subtraction',
        description:
          'Subtracting one single-digit number from another using counting back and fact families.',
        order: 12,
        prerequisites: ['fact-families-addition-subtraction'],
      },
      {
        slug: 'missing-addend-problems',
        name: 'Missing Addend Problems',
        description:
          'Solving problems like "5 + ___ = 9" by using known addition and subtraction facts.',
        order: 13,
        prerequisites: ['single-digit-subtraction'],
      },
    ],
  },
  {
    domain: 'Mathematics',
    skill: 'Addition & Subtraction',
    competency: 'Double Digit Addition',
    concepts: [
      {
        slug: 'double-digit-subtraction-without-regrouping',
        name: 'Double Digit Subtraction Without Regrouping',
        description:
          'Subtracting two-digit numbers column by column when no borrowing is needed (e.g. 58 - 23).',
        order: 10,
        prerequisites: ['adding-without-regrouping'],
      },
      {
        slug: 'double-digit-subtraction-with-regrouping',
        name: 'Double Digit Subtraction With Regrouping',
        description:
          'Subtracting two-digit numbers that require borrowing from the tens place (e.g. 52 - 27).',
        order: 11,
        prerequisites: [
          'double-digit-subtraction-without-regrouping',
          'adding-with-regrouping',
        ],
      },
      {
        slug: 'estimating-sums-and-differences',
        name: 'Estimating Sums and Differences',
        description:
          'Rounding two-digit numbers to the nearest ten to quickly estimate an addition or subtraction answer.',
        order: 12,
        prerequisites: ['double-digit-subtraction-with-regrouping'],
      },
      {
        slug: 'multi-step-word-problems-addition-subtraction',
        name: 'Multi-Step Word Problems (Addition/Subtraction)',
        description:
          'Solving real-world story problems that require more than one addition or subtraction step to reach the answer.',
        order: 13,
        prerequisites: ['estimating-sums-and-differences'],
      },
    ],
  },
  {
    domain: 'Mathematics',
    skill: 'Multiplication',
    competency: 'Times Tables 1-5',
    concepts: [
      {
        slug: 'arrays-and-equal-groups',
        name: 'Arrays and Equal Groups',
        description:
          'Visualizing multiplication as rows and columns of objects (arrays) or groups of equal size.',
        order: 10,
        prerequisites: ['repeated-addition'],
      },
      {
        slug: 'times-table-of-5-and-10',
        name: 'Times Table of 5 and 10',
        description:
          'Learning the skip-counting patterns for multiplying by 5 and by 10.',
        order: 11,
        prerequisites: ['arrays-and-equal-groups'],
      },
      {
        slug: 'commutative-property-of-multiplication',
        name: 'Commutative Property of Multiplication',
        description:
          'Understanding that 3 × 4 gives the same answer as 4 × 3 — order does not change the product.',
        order: 12,
        prerequisites: ['times-tables-2-5'],
      },
      {
        slug: 'multiplying-by-0-and-1',
        name: 'Multiplying by 0 and 1',
        description:
          'Learning the special rules that anything times 0 is 0, and anything times 1 stays the same.',
        order: 13,
        prerequisites: ['commutative-property-of-multiplication'],
      },
    ],
  },
  {
    domain: 'Mathematics',
    skill: 'Multiplication',
    competency: 'Times Tables 6-12',
    concepts: [
      {
        slug: 'times-table-of-6-and-7-strategies',
        name: 'Times Table of 6 and 7 Strategies',
        description:
          'Using known facts (like 5×n and doubling) as stepping stones to figure out the harder 6 and 7 times tables.',
        order: 10,
        prerequisites: ['times-tables-6-9'],
      },
      {
        slug: 'times-table-of-11-and-12-patterns',
        name: 'Times Table of 11 and 12 Patterns',
        description:
          'Spotting the digit patterns in the 11 and 12 times tables to multiply quickly.',
        order: 11,
        prerequisites: ['times-tables-10-12'],
      },
      {
        slug: 'division-as-inverse-of-multiplication',
        name: 'Division as Inverse of Multiplication',
        description:
          'Understanding that division "undoes" multiplication, using times-table facts to solve division problems.',
        order: 12,
        prerequisites: [
          'times-table-of-6-and-7-strategies',
          'times-table-of-11-and-12-patterns',
        ],
      },
      {
        slug: 'multi-digit-multiplication',
        name: 'Multi-Digit Multiplication',
        description:
          'Multiplying a multi-digit number by a single digit using place value and partial products.',
        order: 13,
        prerequisites: ['division-as-inverse-of-multiplication'],
      },
    ],
  },
  {
    domain: 'Mathematics',
    skill: 'Number Sense',
    competency: 'Understanding Place Value',
    concepts: [
      {
        slug: 'thousands-place',
        name: 'Thousands Place',
        description:
          'Extending place value understanding from hundreds to thousands, reading and writing 4-digit numbers.',
        order: 10,
        prerequisites: ['expanded-form'],
      },
      {
        slug: 'comparing-numbers',
        name: 'Comparing Numbers',
        description:
          'Using place value to compare multi-digit numbers with <, >, and = symbols.',
        order: 11,
        prerequisites: ['thousands-place'],
      },
      {
        slug: 'rounding-numbers',
        name: 'Rounding Numbers',
        description:
          'Rounding numbers to the nearest ten, hundred, or thousand using place value rules.',
        order: 12,
        prerequisites: ['comparing-numbers'],
      },
    ],
  },

  // ---------------- SCIENCE ----------------
  {
    domain: 'Science',
    skill: 'Plants & Nature',
    competency: 'Parts of a Plant',
    concepts: [
      {
        slug: 'photosynthesis-basics',
        name: 'Photosynthesis Basics',
        description:
          'Learning how leaves use sunlight, water, and carbon dioxide to make food (glucose) and release oxygen.',
        order: 10,
        prerequisites: ['leaves-and-flowers'],
      },
      {
        slug: 'plant-adaptations',
        name: 'Plant Adaptations',
        description:
          'Exploring how plants change over generations to survive in their environment (thorns, thick leaves, deep roots).',
        order: 11,
        prerequisites: ['photosynthesis-basics'],
      },
      {
        slug: 'pollination-and-seeds',
        name: 'Pollination and Seeds',
        description:
          'Understanding how pollen moves between flowers to create seeds, with help from insects, wind, or animals.',
        order: 12,
        prerequisites: ['plant-adaptations'],
      },
      {
        slug: 'plant-habitats',
        name: 'Plant Habitats',
        description:
          'Comparing how plants are structured differently to thrive in deserts, rainforests, and wetlands.',
        order: 13,
        prerequisites: ['pollination-and-seeds'],
      },
    ],
  },
  {
    domain: 'Science',
    skill: 'Plants & Nature',
    competency: 'Plant Life Cycle',
    concepts: [
      {
        slug: 'pollination-in-the-life-cycle',
        name: 'Pollination in the Life Cycle',
        description:
          'Placing pollination as the step in the life cycle that leads from flower to new seed.',
        order: 10,
        prerequisites: ['growth-to-maturity'],
      },
      {
        slug: 'seed-dispersal-methods',
        name: 'Seed Dispersal Methods',
        description:
          'Learning how seeds travel away from the parent plant — by wind, water, animals, or "popping" pods.',
        order: 11,
        prerequisites: ['pollination-in-the-life-cycle'],
      },
      {
        slug: 'life-cycles-across-plant-species',
        name: 'Life Cycles Across Plant Species',
        description:
          'Comparing the life cycle length and stages of annual plants, perennials, and trees.',
        order: 12,
        prerequisites: ['seed-dispersal-methods'],
      },
    ],
  },
  {
    domain: 'Science',
    skill: 'Solar System',
    competency: 'Planet Names & Order',
    concepts: [
      {
        slug: 'order-of-planets-from-the-sun',
        name: 'Order of Planets from the Sun',
        description:
          'Putting all eight planets in correct order from closest to farthest from the Sun using a memory trick.',
        order: 10,
        prerequisites: ['inner-planets', 'outer-planets'],
      },
      {
        slug: 'rocky-vs-gas-giant-planets',
        name: 'Rocky vs Gas Giant Planets',
        description:
          'Classifying planets as rocky/terrestrial (like Earth) or gas giants (like Jupiter) based on composition.',
        order: 11,
        prerequisites: ['order-of-planets-from-the-sun'],
      },
      {
        slug: 'moons-and-their-planets',
        name: 'Moons and Their Planets',
        description:
          'Learning which planets have moons, and comparing our Moon to moons of other planets like Europa and Titan.',
        order: 12,
        prerequisites: ['rocky-vs-gas-giant-planets'],
      },
      {
        slug: 'dwarf-planets-and-asteroids',
        name: 'Dwarf Planets and Asteroids',
        description:
          'Discovering Pluto and other dwarf planets, plus the asteroid belt between Mars and Jupiter.',
        order: 13,
        prerequisites: ['moons-and-their-planets'],
      },
    ],
  },

  // ---------------- TECHNOLOGY ----------------
  {
    domain: 'Technology',
    skill: 'Block Coding',
    competency: 'Sequences',
    concepts: [
      {
        slug: 'events-and-triggers',
        name: 'Events and Triggers',
        description:
          'Using "when clicked" or "when key pressed" blocks to start a sequence of actions at the right moment.',
        order: 10,
        prerequisites: ['debugging-sequences'],
      },
      {
        slug: 'sprite-movement-sequences',
        name: 'Sprite Movement Sequences',
        description:
          'Chaining "move", "turn", and "go to" blocks in order to make a character move along a planned path.',
        order: 11,
        prerequisites: ['events-and-triggers'],
      },
      {
        slug: 'ordering-actions-logically',
        name: 'Ordering Actions Logically',
        description:
          'Planning the correct order of steps before coding, so each block sets up what the next block needs.',
        order: 12,
        prerequisites: ['sprite-movement-sequences'],
      },
      {
        slug: 'testing-and-debugging-programs',
        name: 'Testing and Debugging Programs',
        description:
          'Running a program, watching what actually happens, and fixing blocks that are out of order or missing.',
        order: 13,
        prerequisites: ['ordering-actions-logically'],
      },
    ],
  },
  {
    domain: 'Technology',
    skill: 'Block Coding',
    competency: 'Loops',
    concepts: [
      {
        slug: 'count-controlled-loops',
        name: 'Count-Controlled Loops',
        description:
          'Using "repeat 10 times" blocks to run the same set of actions an exact number of times.',
        order: 10,
        prerequisites: ['repeat-blocks'],
      },
      {
        slug: 'forever-loops',
        name: 'Forever Loops',
        description:
          'Using "repeat forever" blocks for actions that should keep happening until the program stops.',
        order: 11,
        prerequisites: ['count-controlled-loops'],
      },
      {
        slug: 'nested-loops',
        name: 'Nested Loops',
        description:
          'Placing one loop inside another loop to create repeating patterns, like drawing a grid of shapes.',
        order: 12,
        prerequisites: ['loop-conditions', 'forever-loops'],
      },
      {
        slug: 'loops-with-conditional-exit',
        name: 'Loops with Conditional Exit',
        description:
          'Combining "repeat until" with a condition so a loop stops automatically once a goal is reached.',
        order: 13,
        prerequisites: ['nested-loops'],
      },
    ],
  },
];

const COMPETENCY_PREREQUISITES: CompetencyPrereqSeed[] = [
  {
    domain: 'Language',
    skill: 'Vocabulary',
    competency: 'Synonyms & Antonyms',
    prereqDomain: 'Language',
    prereqSkill: 'Vocabulary',
    prereqCompetency: 'Common Words',
  },
  {
    domain: 'Mathematics',
    skill: 'Addition & Subtraction',
    competency: 'Double Digit Addition',
    prereqDomain: 'Mathematics',
    prereqSkill: 'Addition & Subtraction',
    prereqCompetency: 'Single Digit Addition',
  },
  {
    domain: 'Mathematics',
    skill: 'Addition & Subtraction',
    competency: 'Double Digit Addition',
    prereqDomain: 'Mathematics',
    prereqSkill: 'Number Sense',
    prereqCompetency: 'Understanding Place Value',
  },
  {
    domain: 'Mathematics',
    skill: 'Multiplication',
    competency: 'Times Tables 1-5',
    prereqDomain: 'Mathematics',
    prereqSkill: 'Addition & Subtraction',
    prereqCompetency: 'Single Digit Addition',
  },
  {
    domain: 'Mathematics',
    skill: 'Multiplication',
    competency: 'Times Tables 6-12',
    prereqDomain: 'Mathematics',
    prereqSkill: 'Multiplication',
    prereqCompetency: 'Times Tables 1-5',
  },
  {
    domain: 'Science',
    skill: 'Plants & Nature',
    competency: 'Plant Life Cycle',
    prereqDomain: 'Science',
    prereqSkill: 'Plants & Nature',
    prereqCompetency: 'Parts of a Plant',
  },
  {
    domain: 'Technology',
    skill: 'Block Coding',
    competency: 'Loops',
    prereqDomain: 'Technology',
    prereqSkill: 'Block Coding',
    prereqCompetency: 'Sequences',
  },
];

const LEARNING_PATHS: LearningPathSeed[] = [
  {
    domain: 'Language',
    slug: 'vocabulary-foundations',
    name: 'Vocabulary Foundations',
    description:
      'Build a strong everyday vocabulary: sight words, compound words, homophones, roots, and context clues.',
    ageBand: AgeBand.AGE_8_9,
    order: 1,
    conceptSlugs: [
      'sight-words',
      'everyday-vocabulary',
      'compound-words',
      'homophones',
      'root-words-and-suffixes',
      'context-clues-for-meaning',
    ],
  },
  {
    domain: 'Language',
    slug: 'words-in-context',
    name: 'Words in Context',
    description:
      'Go deeper with synonyms, antonyms, shades of meaning, analogies, idioms, and precise word choice.',
    ageBand: AgeBand.AGE_10_11,
    order: 2,
    conceptSlugs: [
      'synonyms',
      'antonyms',
      'shades-of-meaning',
      'analogies',
      'idioms-and-figurative-language',
      'precise-word-choice-in-writing',
    ],
  },
  {
    domain: 'Mathematics',
    slug: 'addition-subtraction-mastery',
    name: 'Addition & Subtraction Mastery',
    description:
      'Progress from single-digit facts to multi-step, multi-digit addition and subtraction word problems.',
    ageBand: AgeBand.AGE_8_9,
    order: 1,
    conceptSlugs: [
      'counting-on',
      'making-ten',
      'doubles-facts',
      'fact-families-addition-subtraction',
      'single-digit-subtraction',
      'missing-addend-problems',
      'adding-without-regrouping',
      'adding-with-regrouping',
      'double-digit-subtraction-without-regrouping',
      'double-digit-subtraction-with-regrouping',
      'estimating-sums-and-differences',
      'multi-step-word-problems-addition-subtraction',
    ],
  },
  {
    domain: 'Mathematics',
    slug: 'multiplication-and-place-value',
    name: 'Multiplication and Place Value',
    description:
      'Master place value up to the thousands and build fluency across the full multiplication table.',
    ageBand: AgeBand.AGE_10_11,
    order: 2,
    conceptSlugs: [
      'ones-and-tens',
      'hundreds-place',
      'expanded-form',
      'thousands-place',
      'comparing-numbers',
      'rounding-numbers',
      'repeated-addition',
      'arrays-and-equal-groups',
      'times-table-of-5-and-10',
      'times-tables-2-5',
      'commutative-property-of-multiplication',
      'multiplying-by-0-and-1',
      'times-tables-6-9',
      'times-table-of-6-and-7-strategies',
      'times-tables-10-12',
      'times-table-of-11-and-12-patterns',
      'division-as-inverse-of-multiplication',
      'multi-digit-multiplication',
    ],
  },
  {
    domain: 'Science',
    slug: 'plant-world-explorer',
    name: 'Plant World Explorer',
    description:
      'Investigate plant parts, photosynthesis, adaptations, pollination, and the full plant life cycle.',
    ageBand: AgeBand.AGE_8_9,
    order: 1,
    conceptSlugs: [
      'roots-and-stems',
      'leaves-and-flowers',
      'photosynthesis-basics',
      'plant-adaptations',
      'pollination-and-seeds',
      'plant-habitats',
      'seed-germination',
      'growth-to-maturity',
      'pollination-in-the-life-cycle',
      'seed-dispersal-methods',
      'life-cycles-across-plant-species',
    ],
  },
  {
    domain: 'Science',
    slug: 'journey-through-the-solar-system',
    name: 'Journey Through the Solar System',
    description:
      'Explore the planets in order, their composition, moons, and the smaller worlds of our solar system.',
    ageBand: AgeBand.AGE_10_11,
    order: 2,
    conceptSlugs: [
      'inner-planets',
      'outer-planets',
      'order-of-planets-from-the-sun',
      'rocky-vs-gas-giant-planets',
      'moons-and-their-planets',
      'dwarf-planets-and-asteroids',
    ],
  },
  {
    domain: 'Technology',
    slug: 'coding-sequences-101',
    name: 'Coding Sequences 101',
    description:
      'Learn to plan, build, and debug ordered sequences of blocks that make a character act step by step.',
    ageBand: AgeBand.AGE_8_9,
    order: 1,
    conceptSlugs: [
      'step-by-step-instructions',
      'debugging-sequences',
      'events-and-triggers',
      'sprite-movement-sequences',
      'ordering-actions-logically',
      'testing-and-debugging-programs',
    ],
  },
  {
    domain: 'Technology',
    slug: 'mastering-loops',
    name: 'Mastering Loops',
    description:
      'Move from simple repeat blocks to forever loops, nested loops, and loops with conditional exits.',
    ageBand: AgeBand.AGE_12_14,
    order: 2,
    conceptSlugs: [
      'repeat-blocks',
      'loop-conditions',
      'count-controlled-loops',
      'forever-loops',
      'nested-loops',
      'loops-with-conditional-exit',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugifyPathId(domain: string, skill: string, competency: string) {
  return `${domain}::${skill}::${competency}`;
}

async function main() {
  console.log('🌱 Seeding Knowledge Graph: Concepts, Prerequisites & Learning Paths');

  // ---- 1. Resolve domain -> skill -> competency ids from the DB ----------
  const domains = await prisma.domain.findMany({
    include: {
      skills: {
        include: {
          competencies: true,
        },
      },
    },
  });

  const competencyIdByKey = new Map<string, string>();
  const domainIdByName = new Map<string, string>();

  for (const domain of domains) {
    domainIdByName.set(domain.name, domain.id);
    for (const skill of domain.skills) {
      for (const competency of skill.competencies) {
        competencyIdByKey.set(
          slugifyPathId(domain.name, skill.name, competency.name),
          competency.id,
        );
      }
    }
  }

  // ---- 2. Upsert Concepts --------------------------------------------------
  const conceptIdBySlug = new Map<string, string>();

  // Pre-load slugs for concepts that already exist (e.g. previously seeded
  // baseline concepts) so we can wire prerequisites/paths against them too.
  const existingConcepts = await prisma.concept.findMany({
    select: { id: true, slug: true },
  });
  for (const c of existingConcepts) {
    conceptIdBySlug.set(c.slug, c.id);
  }

  let conceptsCreated = 0;
  let conceptsSkippedNoCompetency = 0;

  for (const group of COMPETENCY_CONCEPTS) {
    const key = slugifyPathId(group.domain, group.skill, group.competency);
    const competencyId = competencyIdByKey.get(key);

    if (!competencyId) {
      console.warn(
        `⚠️  Skipping concepts for missing competency: ${group.domain} / ${group.skill} / ${group.competency}`,
      );
      conceptsSkippedNoCompetency += group.concepts.length;
      continue;
    }

    for (const concept of group.concepts) {
      const result = await prisma.concept.upsert({
        where: { slug: concept.slug },
        update: {
          name: concept.name,
          description: concept.description,
          order: concept.order,
          competencyId,
        },
        create: {
          slug: concept.slug,
          name: concept.name,
          description: concept.description,
          order: concept.order,
          competencyId,
        },
      });
      conceptIdBySlug.set(concept.slug, result.id);
      conceptsCreated++;
    }
  }

  console.log(`✅ Upserted ${conceptsCreated} concepts`);
  if (conceptsSkippedNoCompetency > 0) {
    console.log(
      `ℹ️  Skipped ${conceptsSkippedNoCompetency} concepts (competency not found in DB)`,
    );
  }

  // ---- 3. Concept prerequisite edges (DAG) --------------------------------
  let edgesCreated = 0;
  let edgesSkipped = 0;

  for (const group of COMPETENCY_CONCEPTS) {
    for (const concept of group.concepts) {
      const conceptId = conceptIdBySlug.get(concept.slug);
      if (!conceptId || !concept.prerequisites) continue;

      for (const prereqSlug of concept.prerequisites) {
        const prerequisiteId = conceptIdBySlug.get(prereqSlug);
        if (!prerequisiteId) {
          console.warn(
            `⚠️  Skipping prerequisite edge: ${prereqSlug} -> ${concept.slug} (prerequisite concept not found)`,
          );
          edgesSkipped++;
          continue;
        }
        if (prerequisiteId === conceptId) {
          console.warn(`⚠️  Skipping self-referential edge for ${concept.slug}`);
          edgesSkipped++;
          continue;
        }

        const existing = await prisma.conceptPrerequisite.findUnique({
          where: {
            conceptId_prerequisiteId: {
              conceptId,
              prerequisiteId,
            },
          },
        });

        if (existing) {
          edgesSkipped++;
          continue;
        }

        await prisma.conceptPrerequisite.create({
          data: {
            conceptId,
            prerequisiteId,
            type: PrerequisiteType.REQUIRED,
          },
        });
        edgesCreated++;
      }
    }
  }

  console.log(
    `✅ Created ${edgesCreated} concept prerequisite edges (${edgesSkipped} already existed or were skipped)`,
  );

  // ---- 4. Competency prerequisite edges -----------------------------------
  let competencyEdgesCreated = 0;
  let competencyEdgesSkipped = 0;

  for (const rel of COMPETENCY_PREREQUISITES) {
    const competencyId = competencyIdByKey.get(
      slugifyPathId(rel.domain, rel.skill, rel.competency),
    );
    const prerequisiteId = competencyIdByKey.get(
      slugifyPathId(rel.prereqDomain, rel.prereqSkill, rel.prereqCompetency),
    );

    if (!competencyId || !prerequisiteId) {
      console.warn(
        `⚠️  Skipping competency prerequisite: ${rel.competency} <- ${rel.prereqCompetency} (competency missing)`,
      );
      competencyEdgesSkipped++;
      continue;
    }
    if (competencyId === prerequisiteId) {
      competencyEdgesSkipped++;
      continue;
    }

    const existing = await prisma.competencyPrerequisite.findUnique({
      where: {
        competencyId_prerequisiteId: {
          competencyId,
          prerequisiteId,
        },
      },
    });

    if (existing) {
      competencyEdgesSkipped++;
      continue;
    }

    await prisma.competencyPrerequisite.create({
      data: {
        competencyId,
        prerequisiteId,
        type: PrerequisiteType.REQUIRED,
      },
    });
    competencyEdgesCreated++;
  }

  console.log(
    `✅ Created ${competencyEdgesCreated} competency prerequisite edges (${competencyEdgesSkipped} already existed or were skipped)`,
  );

  // ---- 5. Learning Paths + Nodes ------------------------------------------
  let pathsCreated = 0;
  let nodesCreated = 0;
  let nodesSkipped = 0;

  for (const path of LEARNING_PATHS) {
    const domainId = domainIdByName.get(path.domain);
    if (!domainId) {
      console.warn(`⚠️  Skipping learning path (domain not found): ${path.name}`);
      continue;
    }

    const learningPath = await prisma.learningPath.upsert({
      where: { slug: path.slug },
      update: {
        name: path.name,
        description: path.description,
        ageBand: path.ageBand,
        order: path.order,
        domainId,
      },
      create: {
        slug: path.slug,
        name: path.name,
        description: path.description,
        ageBand: path.ageBand,
        order: path.order,
        domainId,
      },
    });
    pathsCreated++;

    for (let i = 0; i < path.conceptSlugs.length; i++) {
      const conceptSlug = path.conceptSlugs[i];
      const conceptId = conceptIdBySlug.get(conceptSlug);

      if (!conceptId) {
        console.warn(
          `⚠️  Skipping learning path node "${conceptSlug}" in "${path.name}" (concept not found)`,
        );
        nodesSkipped++;
        continue;
      }

      const existingNode = await prisma.learningPathNode.findFirst({
        where: {
          pathId: learningPath.id,
          entityType: 'CONCEPT',
          entityId: conceptId,
        },
      });

      if (existingNode) {
        nodesSkipped++;
        continue;
      }

      await prisma.learningPathNode.create({
        data: {
          pathId: learningPath.id,
          entityType: 'CONCEPT',
          entityId: conceptId,
          order: i,
          isOptional: false,
        },
      });
      nodesCreated++;
    }
  }

  console.log(
    `✅ Upserted ${pathsCreated} learning paths, created ${nodesCreated} path nodes (${nodesSkipped} skipped/already existed)`,
  );

  console.log('🌱 Knowledge Graph seed complete.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
