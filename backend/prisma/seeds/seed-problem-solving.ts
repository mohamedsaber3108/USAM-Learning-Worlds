/**
 * Problem Solving Engine + Computational Thinking Engine Seeding
 *
 * Seeds `ProblemSolvingConcept` with 15 real entries covering the four
 * pillars both engines share as commonly taught to kids: decomposition,
 * pattern recognition, abstraction, and algorithm design — closing the
 * "no schema, no seed, no delivery layer" gap noted for both engines in
 * USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b. Mirrors
 * seed-career-exploration.ts / seed-digital-literacy.ts exactly.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const concepts = [
  {
    name: 'Breaking a Big Job Into Small Steps',
    slug: 'breaking-a-big-job-into-small-steps',
    description:
      'Decomposition means splitting a big, scary task into smaller pieces you can actually finish one at a time — like cleaning a whole room by doing "toys," then "clothes," then "bed" instead of "the whole room" all at once.',
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'Recipe Steps: Why Order Matters',
    slug: 'recipe-steps-why-order-matters',
    description:
      'A recipe is a set of ordered steps (an algorithm!) — if you bake the cake before mixing the batter, it goes wrong. Notice how many everyday instructions (getting dressed, brushing teeth) are really just ordered steps in disguise.',
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Spot the Pattern: Shapes and Colors',
    slug: 'spot-the-pattern-shapes-and-colors',
    description:
      'Pattern recognition starts simple: red-blue-red-blue-red-___? Once you can spot what repeats, you can predict what comes next — the same skill that later helps you notice patterns in numbers, words, and even weather.',
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  {
    name: 'What Do All Dogs Have in Common?',
    slug: 'what-do-all-dogs-have-in-common',
    description:
      'Abstraction means picking out the important features and ignoring the rest — a poodle, a bulldog, and a chihuahua look nothing alike, but they all have 4 legs, fur, bark, and are dogs. Focusing on "what matters for this question" is abstraction.',
    category: 'ABSTRACTION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 4,
  },
  {
    name: 'The "If This, Then That" Trick',
    slug: 'the-if-this-then-that-trick',
    description:
      'Lots of problems can be solved with a simple rule: "If it is raining, then bring an umbrella." Computers run on rules exactly like this (called conditionals) — noticing "if/then" patterns in your own decisions is the first step to thinking like a programmer.',
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 5,
  },
  {
    name: 'Debugging: Finding Where It Went Wrong',
    slug: 'debugging-finding-where-it-went-wrong',
    description:
      'When something doesn\'t work — a recipe that tastes off, a paper airplane that won\'t fly — debugging means checking each step one at a time to find exactly where it broke, instead of giving up or starting over blindly.',
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 6,
  },
  {
    name: 'Breaking Down a Group Project',
    slug: 'breaking-down-a-group-project',
    description:
      'A class project (build a diorama, put on a skit) feels huge until you decompose it: research, materials, building, practicing, presenting. Each smaller piece can even be assigned to a different person — decomposition also makes teamwork possible.',
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'Maps Are Abstractions Too',
    slug: 'maps-are-abstractions-too',
    description:
      'A subway map doesn\'t show every tree and building — it only shows what you need (stations and lines) and leaves out everything else. That\'s abstraction: keeping the useful details and throwing away the ones that would just clutter things up.',
    category: 'ABSTRACTION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 8,
  },
  {
    name: 'Finding the Pattern in Multiplication Tables',
    slug: 'finding-the-pattern-in-multiplication-tables',
    description:
      'Notice how the 5-times table always ends in 0 or 5, and the 9-times table\'s digits always add up to 9. Spotting patterns like these doesn\'t just help you memorize facts faster — it\'s the same instinct that helps scientists notice trends in data.',
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 9,
  },
  {
    name: 'Writing Directions Precisely Enough for a Robot',
    slug: 'writing-directions-precisely-enough-for-a-robot',
    description:
      'Try writing directions from your bedroom to the kitchen precise enough that a robot with no common sense could follow them exactly (it won\'t "just know" to open a door). This is exactly what programmers do when writing an algorithm — nothing can be left for the computer to "figure out."',
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 10,
  },
  {
    name: 'Reusing a Solution for a New Problem',
    slug: 'reusing-a-solution-for-a-new-problem',
    description:
      'Once you\'ve solved "how do I sort my books by size," the same steps work for sorting trading cards by rarity or laundry by color. Recognizing when a new problem is really an old problem in disguise saves huge amounts of time — this is pattern recognition applied to problem-solving itself.',
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 11,
  },
  {
    name: 'Choosing What to Ignore When Planning a Trip',
    slug: 'choosing-what-to-ignore-when-planning-a-trip',
    description:
      'Planning a class trip means abstracting away hundreds of tiny real-world details (exact sidewalk cracks, every possible weather scenario) and focusing only on what actually affects the plan: time, cost, safety, and fun. Good abstraction is knowing what\'s safe to leave out.',
    category: 'ABSTRACTION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 12,
  },
  {
    name: 'Decomposing a Science Fair Project',
    slug: 'decomposing-a-science-fair-project',
    description:
      'A full science fair project (question, hypothesis, experiment, data, conclusion, poster) is really 6 separate smaller jobs chained together. Listing them out first — before doing any of them — is what makes a big project feel doable instead of overwhelming.',
    category: 'DECOMPOSITION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 13,
  },
  {
    name: 'Testing Your Solution Before You\'re "Done"',
    slug: 'testing-your-solution-before-youre-done',
    description:
      'Good problem solvers don\'t just build a solution and stop — they test it against tricky cases on purpose ("what if the input is 0?" "what if two people tie?") to catch mistakes before they cause real trouble. This habit of deliberately trying to break your own solution is a core algorithm-design skill.',
    category: 'ALGORITHM_DESIGN',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 14,
  },
  {
    name: 'When a Pattern Breaks: Noticing the Exception',
    slug: 'when-a-pattern-breaks-noticing-the-exception',
    description:
      'Most days the pattern holds ("it rains, so I bring an umbrella and stay dry") but sometimes it doesn\'t (windy rain soaks you anyway). Strong pattern-recognition includes noticing when a rule you trusted stops working — and figuring out why, instead of ignoring the exception.',
    category: 'PATTERN_RECOGNITION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 15,
  },
];

async function main() {
  console.log('Seeding Problem Solving Concepts...');
  for (const concept of concepts) {
    await prisma.problemSolvingConcept.upsert({
      where: { slug: concept.slug },
      update: concept,
      create: concept,
    });
  }
  console.log(`Seeded ${concepts.length} ProblemSolvingConcept rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
