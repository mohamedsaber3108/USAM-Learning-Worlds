import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Flashcard Engine — real, curriculum-aligned spaced-repetition cards.
 * Covers Mathematics, Science, Language, Technology, Social Studies,
 * Critical Thinking, and Creativity domains with age-appropriate content
 * for ages 8-14 (front = prompt/question, back = answer/explanation).
 */
async function main() {
  const domains = await prisma.domain.findMany({
    where: { name: { in: [
      'Mathematics', 'Science', 'Language', 'Technology',
      'Social Studies', 'Critical Thinking', 'Creativity',
      'Health & Wellness', 'Music',
    ] } },
  });
  const byName = new Map(domains.map((d) => [d.name, d.id]));

  const cards: { domain: string; front: string; back: string }[] = [
    // Mathematics
    { domain: 'Mathematics', front: 'What is 7 x 8?', back: '56 — think of it as 7x8 = 7x(10-2) = 70-14 = 56.' },
    { domain: 'Mathematics', front: 'What fraction is equivalent to 0.5?', back: '1/2 — half of a whole.' },
    { domain: 'Mathematics', front: 'What is the perimeter of a square with side 6cm?', back: '24cm — perimeter = 4 x side = 4 x 6 = 24.' },
    { domain: 'Mathematics', front: 'What is a prime number?', back: 'A number greater than 1 with only two factors: 1 and itself (e.g. 2, 3, 5, 7, 11).' },
    { domain: 'Mathematics', front: 'How do you find the area of a rectangle?', back: 'Multiply length x width.' },
    { domain: 'Mathematics', front: 'What is 3/4 as a percentage?', back: '75% — divide 3 by 4 to get 0.75, then multiply by 100.' },
    { domain: 'Mathematics', front: 'What is the order of operations (PEMDAS)?', back: 'Parentheses, Exponents, Multiplication/Division, Addition/Subtraction — left to right.' },
    { domain: 'Mathematics', front: 'What is a negative number plus its positive opposite?', back: '0 — they cancel out (e.g. -5 + 5 = 0).' },
    // Science
    { domain: 'Science', front: 'What are the three states of matter?', back: 'Solid, liquid, and gas.' },
    { domain: 'Science', front: 'What gas do plants absorb during photosynthesis?', back: 'Carbon dioxide (CO2) — they release oxygen.' },
    { domain: 'Science', front: 'What force pulls objects toward Earth?', back: 'Gravity.' },
    { domain: 'Science', front: 'What is the smallest unit of life?', back: 'The cell.' },
    { domain: 'Science', front: 'What planet is known as the Red Planet?', back: 'Mars — its iron oxide (rust) dust gives it a reddish color.' },
    { domain: 'Science', front: 'What is the water cycle step where water turns to vapor?', back: 'Evaporation.' },
    { domain: 'Science', front: 'What do we call animals that only eat plants?', back: 'Herbivores.' },
    { domain: 'Science', front: 'What is the chemical symbol for water?', back: 'H2O — two hydrogen atoms and one oxygen atom.' },
    // Language
    { domain: 'Language', front: 'What is a synonym for "happy"?', back: 'Joyful, glad, or cheerful.' },
    { domain: 'Language', front: 'What is the plural of "child"?', back: 'Children — an irregular plural.' },
    { domain: 'Language', front: 'What part of speech describes an action?', back: 'A verb (e.g. run, jump, think).' },
    { domain: 'Language', front: 'What is a metaphor?', back: 'A figure of speech comparing two things without "like" or "as" (e.g. "Time is money").' },
    { domain: 'Language', front: 'What is the past tense of "go"?', back: '"Went" — an irregular verb.' },
    { domain: 'Language', front: 'What punctuation mark ends a question?', back: 'A question mark (?).' },
    // Technology
    { domain: 'Technology', front: 'What does "CPU" stand for?', back: 'Central Processing Unit — the "brain" of a computer.' },
    { domain: 'Technology', front: 'What is a loop in coding?', back: 'A set of instructions that repeats until a condition is met.' },
    { domain: 'Technology', front: 'What is a variable in programming?', back: 'A named container that stores a value which can change.' },
    { domain: 'Technology', front: 'What does "debugging" mean?', back: 'Finding and fixing errors (bugs) in code.' },
    { domain: 'Technology', front: 'What is the internet?', back: 'A global network connecting computers so they can share information.' },
    // Social Studies
    { domain: 'Social Studies', front: 'What is a continent?', back: 'A large, continuous area of land (e.g. Africa, Asia, Europe).' },
    { domain: 'Social Studies', front: 'What is a democracy?', back: 'A system of government where citizens vote to choose their leaders.' },
    { domain: 'Social Studies', front: 'What is culture?', back: 'The shared beliefs, customs, food, art, and traditions of a group of people.' },
    // Critical Thinking
    { domain: 'Critical Thinking', front: 'What is an "assumption"?', back: 'Something believed to be true without proof.' },
    { domain: 'Critical Thinking', front: 'What is the difference between a fact and an opinion?', back: 'A fact can be proven true or false; an opinion is a personal belief or judgment.' },
    { domain: 'Critical Thinking', front: 'What is cause and effect?', back: 'A relationship where one event (cause) makes another event (effect) happen.' },
    // Creativity
    { domain: 'Creativity', front: 'What is "brainstorming"?', back: 'Generating many ideas quickly without judging them, to find creative solutions.' },
    { domain: 'Creativity', front: 'What does it mean to "think outside the box"?', back: 'Approaching a problem in a new, unconventional way.' },
    // Health & Wellness
    { domain: 'Health & Wellness', front: 'How many hours of sleep do kids aged 8-14 usually need?', back: 'About 9-11 hours per night.' },
    { domain: 'Health & Wellness', front: 'What are the main food groups?', back: 'Fruits, vegetables, grains, protein, and dairy.' },
    // Music
    { domain: 'Music', front: 'What are the 7 notes in a musical scale (Do-Re-Mi)?', back: 'Do, Re, Mi, Fa, Sol, La, Ti (then back to Do).' },
  ];

  let created = 0;
  for (const c of cards) {
    const domainId = byName.get(c.domain);
    if (!domainId) continue;
    const exists = await prisma.flashcard.findFirst({
      where: { domainId, front: c.front },
    });
    if (exists) continue;
    await prisma.flashcard.create({
      data: { domainId, front: c.front, back: c.back, isActive: true },
    });
    created++;
  }

  console.log(`Flashcards seed complete. Created ${created} new flashcards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
