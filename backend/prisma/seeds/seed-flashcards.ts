import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Flashcard Engine — real, curriculum-aligned spaced-repetition cards.
 *
 * FIX (2026-10-02 reconciliation audit): this seed previously looked up
 * domains by name -- 'Mathematics', 'Science', 'Language', 'Technology',
 * 'Social Studies', 'Health & Wellness', 'Music' -- none of which exist in
 * production. The product was rebuilt around 4 LOCKED primary domains
 * (English, Coding, AI Literacy, Entrepreneurship; see
 * plans-local/01_PRODUCT_SCOPE.md and backend/prisma/seed.ts's own domain
 * list), so this seed silently created ZERO flashcards every time it ran --
 * confirmed via a direct production query (flashcards: 0) even after
 * running the seed. Remapped every card to one of the 4 real domains,
 * dropping only the handful of items with no honest fit in any of the 4
 * (e.g. a music-notes card) rather than force-fitting them.
 */
async function main() {
  const domains = await prisma.domain.findMany({
    where: { slug: { in: ['english', 'coding', 'ai-literacy', 'entrepreneurship'] } },
  });
  const byName = new Map(domains.map((d) => [d.name, d.id]));

  const cards: { domain: string; front: string; back: string }[] = [
    // English
    { domain: 'English', front: 'What is a synonym for "happy"?', back: 'Joyful, glad, or cheerful.' },
    { domain: 'English', front: 'What is the plural of "child"?', back: 'Children — an irregular plural.' },
    { domain: 'English', front: 'What part of speech describes an action?', back: 'A verb (e.g. run, jump, think).' },
    { domain: 'English', front: 'What is a metaphor?', back: 'A figure of speech comparing two things without "like" or "as" (e.g. "Time is money").' },
    { domain: 'English', front: 'What is the past tense of "go"?', back: '"Went" — an irregular verb.' },
    { domain: 'English', front: 'What punctuation mark ends a question?', back: 'A question mark (?).' },
    { domain: 'English', front: 'What is an antonym for "enormous"?', back: 'Tiny, small, or little.' },
    { domain: 'English', front: 'What is a noun?', back: 'A word that names a person, place, thing, or idea (e.g. dog, school, happiness).' },
    // Coding
    { domain: 'Coding', front: 'What does "CPU" stand for?', back: 'Central Processing Unit — the "brain" of a computer.' },
    { domain: 'Coding', front: 'What is a loop in coding?', back: 'A set of instructions that repeats until a condition is met.' },
    { domain: 'Coding', front: 'What is a variable in programming?', back: 'A named container that stores a value which can change.' },
    { domain: 'Coding', front: 'What does "debugging" mean?', back: 'Finding and fixing errors (bugs) in code.' },
    { domain: 'Coding', front: 'What is the internet?', back: 'A global network connecting computers so they can share information.' },
    { domain: 'Coding', front: 'What is a function?', back: 'A reusable block of code that performs a specific task when you call it.' },
    { domain: 'Coding', front: 'What is a conditional (if statement)?', back: 'Code that only runs when a certain condition is true.' },
    { domain: 'Coding', front: 'What is an algorithm?', back: 'A step-by-step set of instructions for solving a problem or completing a task.' },
    // AI Literacy
    { domain: 'AI Literacy', front: 'What is AI trained on?', back: 'Training data — lots of real examples it learns patterns from.' },
    { domain: 'AI Literacy', front: 'Can AI make mistakes?', back: 'Yes — AI can be confidently wrong, so it is important to double-check important answers.' },
    { domain: 'AI Literacy', front: 'What is a "prompt"?', back: 'The instructions or question you give an AI to tell it what you want.' },
    { domain: 'AI Literacy', front: 'What does it mean for AI to be "biased"?', back: 'When an AI treats some people or ideas unfairly because of patterns in its training data.' },
    { domain: 'AI Literacy', front: 'Who should check important AI decisions?', back: 'A real person — humans should stay in charge of decisions that really matter.' },
    // Entrepreneurship
    { domain: 'Entrepreneurship', front: 'What is a "need" vs. a "want"?', back: 'A need is something you must have to live (food, water); a want is something nice to have but not required.' },
    { domain: 'Entrepreneurship', front: 'What is profit?', back: 'The money left over after you subtract your costs from what you earned.' },
    { domain: 'Entrepreneurship', front: 'What is a budget?', back: 'A plan for how you will spend and save your money.' },
    { domain: 'Entrepreneurship', front: 'What is brainstorming?', back: 'Generating many ideas quickly without judging them, to find creative solutions.' },
    { domain: 'Entrepreneurship', front: 'What is a customer?', back: 'A person who buys or uses what you are offering.' },
    { domain: 'Entrepreneurship', front: 'Why save money instead of spending it all?', back: 'So you have money ready for emergencies or bigger goals later.' },
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
