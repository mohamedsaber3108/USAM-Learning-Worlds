/**
 * Age Variant Seeding — Wave 2 (closes remaining ZERO_AGE_VARIANT_COVERAGE
 * Content-QA flags from Tick 18's scan)
 *
 * Wave 1 (seed-age-variants.ts) covered 8 Activity + 2 Mission rows.
 * This wave covers the remaining 18 Activity + 7 Mission rows that were
 * still flagged by `POST /api/admin/content-qa/scan` as having zero
 * AgeVariant coverage, closing the gap to 0 remaining flags.
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
  label: string;
  variants: Record<AgeBand, VariantSpec>;
}

const ENTITIES: EntityVariants[] = [
  {
    entityType: 'ACTIVITY', entityId: 'd716138c-d27b-4ed6-b2f2-dfd90b8e67dc', label: 'Explain photosynthesis',
    variants: {
      AGE_8_9: { framing: 'Plants eat sunlight! Tell us in your own words how a plant makes its food.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think about sun, water, and leaves — draw it if that helps you explain.' },
      AGE_10_11: { framing: 'Describe, step by step, how a plant produces its own food.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Mention sunlight, water, and leaves in your explanation.' },
      AGE_12_14: { framing: 'Explain the process of photosynthesis in a plant.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Use correct scientific vocabulary where possible.' },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '14f1b749-88ae-4a4a-9149-00d5e37b590f', label: 'How many planets are there?',
    variants: {
      AGE_8_9: { framing: 'Our solar system is a big family of planets around the Sun. How many planets live there?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Picture the solar system picture and count the planets.' },
      AGE_10_11: { framing: 'How many planets orbit the Sun in our solar system?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'State the number of planets in the solar system.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '86c34711-7902-4184-a84d-9ac106fc9d39', label: 'Match the synonyms',
    variants: {
      AGE_8_9: { framing: 'Some words mean almost the same thing! Match each word to its buddy word.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Say each word out loud before matching.' },
      AGE_10_11: { framing: 'Match each word with its synonym (a word that means the same thing).', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Pair each word with its correct synonym.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'a8a3d4d6-bbc2-4da0-bef5-1d6f6bde98b1', label: 'Opposite of "hot"',
    variants: {
      AGE_8_9: { framing: 'Hot and cold are opposites! What is the opposite of "hot"?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think of ice cream (cold) vs. soup (hot).' },
      AGE_10_11: { framing: 'What word means the opposite of "hot"?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Identify the antonym of "hot".', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '99544cab-6aef-4233-922a-0ba19e091f96', label: 'Order the plant life cycle',
    variants: {
      AGE_8_9: { framing: 'A tiny seed grows into a big plant! Put the steps in the right order.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think about what happens first: does a flower come before or after the seed sprouts?' },
      AGE_10_11: { framing: 'Arrange the stages of a plant\u2019s life cycle in the correct order.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Sequence the stages of plant growth correctly.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'b862e1fc-4ba8-4123-a34d-dcca9579d859', label: 'Order the steps to draw a square',
    variants: {
      AGE_8_9: { framing: 'Robots follow instructions one at a time! Put these steps in order to draw a square.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Imagine walking in a square shape yourself — move, then turn, then move again.' },
      AGE_10_11: { framing: 'Put these instructions in the correct order to make a robot draw a square.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Sequence these commands to correctly draw a square.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '6490c5b9-7447-48e7-a6ab-98ba679cc6c9', label: 'Place Value Challenge',
    variants: {
      AGE_8_9: { framing: 'Numbers have secret places! In 347, what is the value of the digit 4?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Remember: ones, tens, hundreds — count from the right.' },
      AGE_10_11: { framing: 'In the number 347, determine the value of the digit 4 based on its place.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Determine the place value of the digit 4 in 347.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'f6f18348-f49a-4027-88fc-48833c2af942', label: 'What do leaves do?',
    variants: {
      AGE_8_9: { framing: 'Leaves are like tiny food factories! What is their main job?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think about sunlight hitting the leaves.' },
      AGE_10_11: { framing: 'What is the main function of leaves in a plant?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Identify the primary function of leaves.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '91f3801f-863b-432a-a5d7-39784a7d86fd', label: 'What does "ancient" mean?',
    variants: {
      AGE_8_9: { framing: 'Ancient things are super, super old! What does "ancient" mean?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think of dinosaurs or pyramids — they are ancient.' },
      AGE_10_11: { framing: 'What does the word "ancient" mean?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Define the term "ancient".', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'dcf52683-7ee0-4609-aef2-695b44df4bfa', label: 'What does "enormous" mean?',
    variants: {
      AGE_8_9: { framing: 'Enormous means REALLY, REALLY big! What does "enormous" mean?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think of an elephant or a whale — they are enormous.' },
      AGE_10_11: { framing: 'What does the word "enormous" mean?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Define the term "enormous".', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'cdebd2ec-e900-4579-b520-661e4373539a', label: 'What does a loop do?',
    variants: {
      AGE_8_9: { framing: 'Sometimes we want a robot to do the same thing again and again. What does a loop do?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think of clapping your hands 5 times in a row — that is a loop!' },
      AGE_10_11: { framing: 'What does a loop do in a computer program?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Describe the function of a loop in code.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '35e3b08b-effd-42c5-bacf-b3adfdf0a85e', label: 'What is 7 x 8?',
    variants: {
      AGE_8_9: { framing: 'You have 7 boxes with 8 toys in each box. How many toys in total?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Skip count by 8, seven times: 8, 16, 24...' },
      AGE_10_11: { framing: 'What is the product of 7 and 8?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Try breaking it into (7x7) + 7 if you don\u2019t remember it directly.' },
      AGE_12_14: { framing: 'Evaluate: 7 x 8.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '9e5301c5-9afa-471a-a930-be1415c9dd5f', label: 'What is 9 x 6?',
    variants: {
      AGE_8_9: { framing: 'You have 9 plates with 6 cookies on each. How many cookies altogether?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Skip count by 6, nine times, or draw groups.' },
      AGE_10_11: { framing: 'What is the product of 9 and 6?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Try (10x6) - 6 as a shortcut.' },
      AGE_12_14: { framing: 'Evaluate: 9 x 6.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'cec085c1-adb5-410f-b68d-5f872b3da711', label: 'What is a sequence?',
    variants: {
      AGE_8_9: { framing: 'When we do things one after another in order, that is a sequence! Explain what it means in coding.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think of following a recipe, step by step.' },
      AGE_10_11: { framing: 'Explain what a sequence means in computer programming.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Define the term "sequence" as used in coding.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'def46854-a064-492b-9ae6-99b12d0fd92c', label: 'Which is the largest planet?',
    variants: {
      AGE_8_9: { framing: 'One planet is the biggest of all! Which planet is the largest?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Look at the sizes of planets in the picture.' },
      AGE_10_11: { framing: 'Which planet in our solar system is the largest?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Identify the largest planet in the solar system.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'e0b1700e-7643-4f6b-82ca-76b7b1de751e', label: 'Which part of a plant absorbs water?',
    variants: {
      AGE_8_9: { framing: 'Plants drink water through a special part! Which part absorbs water?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Think about what is underground, in the soil.' },
      AGE_10_11: { framing: 'Which part of a plant is responsible for absorbing water from the soil?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Identify the plant structure responsible for water absorption.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: 'cc394eb9-6099-4c2f-85bf-97dc6804d09a', label: 'Which planet is closest to the Sun?',
    variants: {
      AGE_8_9: { framing: 'One planet lives closest to the Sun, and it gets very hot! Which planet is it?', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Look at the order of planets in the solar system picture.' },
      AGE_10_11: { framing: 'Which planet is closest to the Sun?', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Identify the planet closest to the Sun.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'ACTIVITY', entityId: '3fc70a4a-a380-4ccf-9553-99c2ea6b00e6', label: 'Write a simple loop',
    variants: {
      AGE_8_9: { framing: 'Let\u2019s make the computer say "Hello" three times using a loop! Write the code.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Remember: a for-loop repeats the line inside it.' },
      AGE_10_11: { framing: 'Write code that prints "Hello" 3 times using a loop.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Implement a loop that prints "Hello" exactly 3 times.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  // Missions
  {
    entityType: 'MISSION', entityId: 'fcb992fc-20b6-4c3a-b445-300c3dbfc613', label: 'Code Builder: First Steps',
    variants: {
      AGE_8_9: { framing: 'Meet Codey the robot! Help Codey learn to follow simple instructions and build your very first program.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Big blocks, playful hints, and celebratory animations when you get it right.' },
      AGE_10_11: { framing: 'Learn the building blocks of programming — sequences, loops, and instructions — with Codey as your guide.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Hints available, moderate challenge with real code snippets.' },
      AGE_12_14: { framing: 'Build foundational programming skills: sequencing, loops, and basic syntax.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Independent problem-solving with minimal scaffolding.' },
    },
  },
  {
    entityType: 'MISSION', entityId: 'coding-sandbox-demo-mission', label: 'Coding Sandbox Demo',
    variants: {
      AGE_8_9: { framing: 'Try out the coding sandbox with Codey — a safe place to experiment and see what code can do!', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED },
      AGE_10_11: { framing: 'Explore the coding sandbox and experiment with real code in a guided environment.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Use the coding sandbox to independently test and refine code.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'MISSION', entityId: '13092e2b-a509-4bc0-bb34-c90129e1291c', label: 'Math Challenge: Speed Round',
    variants: {
      AGE_8_9: { framing: 'Race against the clock with Zein in a fun math speed challenge! Every correct answer earns a star.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Slower pace, encouraging feedback, no penalty for taking time.' },
      AGE_10_11: { framing: 'Test your speed and accuracy with a series of quick math problems alongside Zein.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED, surface: 'Timed rounds with moderate difficulty and helpful hints.' },
      AGE_12_14: { framing: 'Compete against the clock to solve rapid-fire math problems.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED, surface: 'Fast-paced, higher difficulty, minimal hand-holding.' },
    },
  },
  {
    entityType: 'MISSION', entityId: 'cb83751a-b046-4edc-93be-a7aceb4f17c1', label: 'Nature Journal',
    variants: {
      AGE_8_9: { framing: 'Become a nature explorer with Luma! Observe plants and animals and write about what you discover.', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Picture prompts and simple sentence starters to guide journaling.' },
      AGE_10_11: { framing: 'Keep a nature journal, recording observations and connecting them to what you learn about ecosystems.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Maintain a scientific nature journal, documenting observations with analytical reasoning.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'MISSION', entityId: 'e945f480-b18c-42b0-98ef-ede85d88005b', label: 'Plant Detective',
    variants: {
      AGE_8_9: { framing: 'Become a plant detective with Luma and solve fun clues about how plants grow and live!', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Colorful clues, friendly Luma narration, simple vocabulary.' },
      AGE_10_11: { framing: 'Investigate plant biology by solving a series of science-based clues and challenges.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Apply plant biology concepts to solve investigative science challenges.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'MISSION', entityId: 'ae634716-23e0-40a7-af82-635ceced30fa', label: 'Space Voyager',
    variants: {
      AGE_8_9: { framing: 'Blast off with Nova on a journey through the solar system, discovering planets along the way!', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Vivid space visuals, simple facts, lots of encouragement.' },
      AGE_10_11: { framing: 'Travel through the solar system with Nova, learning key facts about each planet.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Explore the solar system, engaging with more detailed astronomical concepts.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
  {
    entityType: 'MISSION', entityId: '2f2ea7af-6c5e-4c0d-b9c2-a50f99bcb2b4', label: 'Word Wizard',
    variants: {
      AGE_8_9: { framing: 'Cast word spells with Tala the Word Wizard and discover new vocabulary through fun challenges!', languageLevel: 'simple', scaffoldLevel: ScaffoldLevel.MODELLED, surface: 'Playful wizard theme, simple words, visual cues.' },
      AGE_10_11: { framing: 'Expand your vocabulary with Tala through word-matching and meaning challenges.', languageLevel: 'moderate', scaffoldLevel: ScaffoldLevel.GUIDED },
      AGE_12_14: { framing: 'Build advanced vocabulary through nuanced word-meaning challenges.', languageLevel: 'complex', scaffoldLevel: ScaffoldLevel.COACHED },
    },
  },
];

async function main() {
  let created = 0;
  let skipped = 0;
  for (const entity of ENTITIES) {
    for (const ageBand of Object.keys(entity.variants) as AgeBand[]) {
      const spec = entity.variants[ageBand];
      const existing = await prisma.ageVariant.findUnique({
        where: { entityType_entityId_ageBand: { entityType: entity.entityType, entityId: entity.entityId, ageBand } },
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
          surface: spec.surface ?? null,
        },
      });
      created++;
    }
    console.log(`  Seeded ${entity.entityType} "${entity.label}"`);
  }
  console.log(`\nAge Variant Wave 2 seed complete: ${created} created, ${skipped} already existed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
