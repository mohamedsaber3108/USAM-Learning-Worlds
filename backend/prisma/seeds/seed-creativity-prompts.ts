/**
 * Creativity Engine Seeding
 *
 * Seeds `CreativityPrompt` with 10 real open-ended creative prompts spanning
 * multiple Domains (science, math, language/arts, technology,
 * social-studies), each genuinely open-ended (no single "correct" answer) —
 * closes USAM_KIDS_ENGINE_GAP_MATRIX.md's "no dedicated creativity workflow,
 * prompt library, or output gallery" finding.
 *
 * Domain lookups are by live `slug` (backend/prisma/seed.ts), not
 * hardcoded IDs, so this seed is safe to re-run in any environment.
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

const promptDefs = [
  {
    title: 'Poster: Explain Photosynthesis',
    slug: 'poster-explain-photosynthesis',
    prompt:
      'Design a poster that explains photosynthesis to a kid who has never heard of it. Use at least one drawing and one simple sentence for each step — sunlight in, food and oxygen out.',
    domainSlug: 'science',
    ageBand: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    title: 'Poem: Your Favorite Number',
    slug: 'poem-your-favorite-number',
    prompt:
      'Write a 4-line poem about your favorite number. Explain why you like it, what it reminds you of, or what would happen if the world only had that many of everything.',
    domainSlug: 'mathematics',
    ageBand: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    title: 'Invent a Creature and Its Habitat',
    slug: 'invent-a-creature-and-its-habitat',
    prompt:
      'Invent a creature that could survive in a place no real animal lives (the middle of a volcano, the bottom of the deepest ocean, outer space). Describe 3 special features it has and why each one helps it survive there.',
    domainSlug: 'science',
    ageBand: AgeBand.AGE_10_11,
    order: 3,
  },
  {
    title: 'Design a Board Game About a Math Topic',
    slug: 'design-a-board-game-about-a-math-topic',
    prompt:
      'Design a simple board game that teaches players about fractions, multiplication, or shapes (pick one). Describe the goal, the rules, and one fun twist that makes it different from a normal board game.',
    domainSlug: 'mathematics',
    ageBand: AgeBand.AGE_10_11,
    order: 4,
  },
  {
    title: 'Write a Short Story With No Villain',
    slug: 'write-a-short-story-with-no-villain',
    prompt:
      'Write a short story (6-10 sentences) where the main problem is not caused by a villain — it could be weather, a misunderstanding, or bad luck. Show how the characters solve it by working together.',
    domainSlug: 'language',
    ageBand: AgeBand.AGE_10_11,
    order: 5,
  },
  {
    title: 'Redesign an Everyday Object',
    slug: 'redesign-an-everyday-object',
    prompt:
      'Pick one everyday object (a backpack, a water bottle, a pencil case) and redesign it to solve one annoying problem it has. Sketch or describe your redesign and explain exactly what problem it fixes.',
    domainSlug: 'engineering',
    ageBand: AgeBand.AGE_10_11,
    order: 6,
  },
  {
    title: 'Compose Sound Effects for a Silent Scene',
    slug: 'compose-sound-effects-for-a-silent-scene',
    prompt:
      'Imagine a short silent scene (a cat sneaking across a kitchen at night). Describe or hum 4 different sounds you would add and explain what feeling each sound is meant to create.',
    domainSlug: 'music',
    ageBand: AgeBand.AGE_8_9,
    order: 7,
  },
  {
    title: 'Design an App Icon and Name for a Kindness App',
    slug: 'design-an-app-icon-and-name-for-a-kindness-app',
    prompt:
      'Imagine an app whose only purpose is to help people be kinder to each other. Give it a name, describe its icon, and describe one feature it would have.',
    domainSlug: 'technology',
    ageBand: AgeBand.AGE_12_14,
    order: 8,
  },
  {
    title: 'Design a Flag for an Imaginary Country',
    slug: 'design-a-flag-for-an-imaginary-country',
    prompt:
      'Invent a country with one important value it cares about most (fairness, curiosity, courage). Design a flag for it and explain what every color and shape on the flag represents.',
    domainSlug: 'social-studies',
    ageBand: AgeBand.AGE_10_11,
    order: 9,
  },
  {
    title: 'Write Rules for a Game That Doesn\'t Exist Yet',
    slug: 'write-rules-for-a-game-that-doesnt-exist-yet',
    prompt:
      'Invent a brand-new playground or sports game that mixes two things you like (e.g. tag + basketball). Write out the rules clearly enough that a stranger could read them and play it correctly on the first try.',
    domainSlug: 'physical-education',
    ageBand: AgeBand.AGE_12_14,
    order: 10,
  },
];

async function main() {
  console.log('Seeding Creativity Prompts...');
  let created = 0;
  for (const p of promptDefs) {
    const domain = await prisma.domain.findUnique({ where: { slug: p.domainSlug } });
    await prisma.creativityPrompt.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        prompt: p.prompt,
        domainId: domain?.id ?? null,
        ageBand: p.ageBand,
        order: p.order,
      },
      create: {
        title: p.title,
        slug: p.slug,
        prompt: p.prompt,
        domainId: domain?.id ?? null,
        ageBand: p.ageBand,
        order: p.order,
      },
    });
    created += 1;
  }
  console.log(`Seeded ${created} CreativityPrompt rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
