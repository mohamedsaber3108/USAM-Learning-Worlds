/**
 * Cross-Curricular Concepts Seeding
 *
 * Seeds AILiteracyConcept, EntrepreneurshipConcept, and FinancialLiteracyConcept
 * with real, age-appropriate content for learners aged 8-14.
 *
 * Age bands (AgeBand enum): AGE_8_9, AGE_10_11, AGE_12_14
 */

import { PrismaClient, AgeBand } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// AI LITERACY CONCEPTS
// ---------------------------------------------------------------------------
const aiLiteracyConcepts = [
  // WHAT_IS_AI
  {
    name: 'What Is Artificial Intelligence?',
    slug: 'what-is-artificial-intelligence',
    description:
      'AI is technology that lets computers do tasks that normally need human thinking, like recognizing pictures, understanding speech, or playing games.',
    category: 'WHAT_IS_AI',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'AI vs. Regular Computer Programs',
    slug: 'ai-vs-regular-programs',
    description:
      'A regular program follows fixed instructions every time. An AI program can notice patterns in examples and change how it responds based on what it has seen.',
    category: 'WHAT_IS_AI',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 2,
  },
  {
    name: 'Where You Meet AI Every Day',
    slug: 'where-you-meet-ai-every-day',
    description:
      'Voice assistants, video recommendations, photo filters, and spelling/grammar checkers are all examples of AI already helping you.',
    category: 'WHAT_IS_AI',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  {
    name: 'Narrow AI vs. General AI',
    slug: 'narrow-ai-vs-general-ai',
    description:
      "Today's AI is 'narrow' — great at one job like translating text — but not able to do everything a human can. True 'general' AI that matches all human abilities does not exist yet.",
    category: 'WHAT_IS_AI',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 4,
  },

  // HOW_MODELS_LEARN
  {
    name: 'Learning From Examples',
    slug: 'learning-from-examples',
    description:
      'AI models learn by looking at thousands of examples (like pictures of cats and dogs) and finding patterns that tell them apart, similar to how you learn to recognize animals.',
    category: 'HOW_MODELS_LEARN',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 5,
  },
  {
    name: 'What Is Training Data?',
    slug: 'what-is-training-data',
    description:
      'Training data is the big collection of examples an AI studies before it can make predictions. Better, more varied data usually leads to a smarter, fairer AI.',
    category: 'HOW_MODELS_LEARN',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 6,
  },
  {
    name: 'Trial, Error, and Feedback',
    slug: 'trial-error-and-feedback',
    description:
      'Many AI systems improve by guessing, checking if the guess was right, and adjusting — over millions of tiny rounds — the same way you get better at a video game by practicing.',
    category: 'HOW_MODELS_LEARN',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'Neural Networks in Simple Terms',
    slug: 'neural-networks-simple-terms',
    description:
      'A neural network is a system of connected math "neurons" loosely inspired by the brain. Signals pass through layers, and the connections get stronger or weaker as the model learns.',
    category: 'HOW_MODELS_LEARN',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 8,
  },
  {
    name: 'Why AI Can Make Mistakes',
    slug: 'why-ai-can-make-mistakes',
    description:
      'AI can be wrong when its training data was incomplete, outdated, or biased, or when it faces a situation very different from anything it has seen before.',
    category: 'HOW_MODELS_LEARN',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 9,
  },

  // AI_ETHICS
  {
    name: 'AI Can Be Biased',
    slug: 'ai-can-be-biased',
    description:
      'If the examples used to train an AI are unfair or unbalanced, the AI can end up making unfair decisions too — this is called bias, and people work hard to reduce it.',
    category: 'AI_ETHICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 10,
  },
  {
    name: 'Privacy and Your Data',
    slug: 'privacy-and-your-data',
    description:
      'AI tools often learn from personal information like photos or messages. It matters who collects that data, how it is stored, and whether people gave permission to use it.',
    category: 'AI_ETHICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 11,
  },
  {
    name: 'AI-Generated Content and Truth',
    slug: 'ai-generated-content-and-truth',
    description:
      'AI can create text, images, and videos that look real but are not — these are sometimes called deepfakes or AI hallucinations. Always check important information with a trusted source.',
    category: 'AI_ETHICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 12,
  },
  {
    name: 'Who Is Responsible for AI Decisions?',
    slug: 'who-is-responsible-for-ai-decisions',
    description:
      'When an AI makes a mistake — like recommending the wrong thing — the people and companies who built and used it are responsible, not the AI itself, because AI has no judgment of its own.',
    category: 'AI_ETHICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 13,
  },
  {
    name: 'Using AI Fairly at School',
    slug: 'using-ai-fairly-at-school',
    description:
      'AI tools can help you brainstorm or check your work, but turning in AI-written work as entirely your own is dishonest. Good AI use means being transparent about how you used it.',
    category: 'AI_ETHICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 14,
  },

  // PROMPT_BASICS
  {
    name: 'What Is a Prompt?',
    slug: 'what-is-a-prompt',
    description:
      'A prompt is the question or instruction you give an AI chatbot. The clearer your prompt, the better the AI usually understands what you want.',
    category: 'PROMPT_BASICS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 15,
  },
  {
    name: 'Being Specific Gets Better Answers',
    slug: 'being-specific-gets-better-answers',
    description:
      "Asking 'Tell me about animals' gives a huge, vague answer. Asking 'Give me 3 fun facts about dolphins for a 10-year-old' gives a focused, useful answer.",
    category: 'PROMPT_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 16,
  },
  {
    name: 'Giving AI Context and Examples',
    slug: 'giving-ai-context-and-examples',
    description:
      'Telling an AI who the answer is for, what format you want, and giving an example of a good answer helps it match your expectations more closely.',
    category: 'PROMPT_BASICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 17,
  },
  {
    name: 'Double-Checking AI Answers',
    slug: 'double-checking-ai-answers',
    description:
      'Even a good prompt can get an answer with mistakes. Always double-check facts, numbers, and links an AI gives you before using them for something important.',
    category: 'PROMPT_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 18,
  },
];

// ---------------------------------------------------------------------------
// ENTREPRENEURSHIP CONCEPTS
// ---------------------------------------------------------------------------
const entrepreneurshipConcepts = [
  // IDEA_GENERATION
  {
    name: 'What Is an Entrepreneur?',
    slug: 'what-is-an-entrepreneur',
    description:
      'An entrepreneur is someone who spots a problem or need and creates something — a product, service, or idea — to solve it, taking on some risk to make it happen.',
    category: 'IDEA_GENERATION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'Finding a Problem Worth Solving',
    slug: 'finding-a-problem-worth-solving',
    description:
      'Great business ideas usually start by noticing something annoying, slow, or missing in everyday life and asking "how could this be better?"',
    category: 'IDEA_GENERATION',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Brainstorming Without Judging',
    slug: 'brainstorming-without-judging',
    description:
      'When generating ideas, write down every idea first — even silly ones — without deciding if they are good or bad yet. Judging too early kills creative ideas.',
    category: 'IDEA_GENERATION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 3,
  },
  {
    name: 'Improving an Existing Idea',
    slug: 'improving-an-existing-idea',
    description:
      'Not every idea has to be brand new — many successful businesses simply made an existing product cheaper, faster, kinder to the planet, or more fun.',
    category: 'IDEA_GENERATION',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 4,
  },
  {
    name: 'Testing an Idea With Real People',
    slug: 'testing-an-idea-with-real-people',
    description:
      'Before building something big, smart entrepreneurs ask a few real people if they would actually use or buy it — this quick test can save a lot of wasted effort.',
    category: 'IDEA_GENERATION',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 5,
  },

  // BUSINESS_BASICS
  {
    name: 'Customers and Value',
    slug: 'customers-and-value',
    description:
      'A customer is someone who pays for a product or service because it gives them value — it saves time, solves a problem, or makes them happy.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 6,
  },
  {
    name: 'Costs and Revenue',
    slug: 'costs-and-revenue',
    description:
      'Revenue is the money a business earns from selling. Costs are the money spent to make and sell the product, like materials or supplies.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'What Is Profit?',
    slug: 'what-is-profit',
    description:
      'Profit is what remains after you subtract all your costs from your revenue. A business needs profit over time to keep running and grow.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 8,
  },
  {
    name: 'Pricing Your Product',
    slug: 'pricing-your-product',
    description:
      'A good price covers your costs, earns some profit, and still feels fair to the customer compared to similar products — pricing too high or too low both cause problems.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 9,
  },
  {
    name: 'Competition and Standing Out',
    slug: 'competition-and-standing-out',
    description:
      'Competitors are other businesses offering something similar. Standing out means being cheaper, better quality, faster, or offering something unique they do not.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 10,
  },
  {
    name: 'Marketing: Telling People About Your Idea',
    slug: 'marketing-telling-people',
    description:
      'Marketing is how you let people know your product exists and why they should care — posters, word of mouth, and social media are all forms of marketing.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 11,
  },
  {
    name: 'Risk and Reward',
    slug: 'risk-and-reward',
    description:
      'Starting a business means risking time, money, or effort without a guarantee of success — but taking a smart, well-planned risk can lead to a big reward.',
    category: 'BUSINESS_BASICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 12,
  },

  // SIMULATIONS
  {
    name: 'Lemonade Stand Simulation: Setting a Price',
    slug: 'lemonade-stand-simulation-pricing',
    description:
      'Practice picking a price for lemonade that covers the cost of lemons, sugar, and cups while still attracting customers on a hot day.',
    category: 'SIMULATIONS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 13,
  },
  {
    name: 'Simulation: Choosing Your First Product',
    slug: 'simulation-choosing-your-first-product',
    description:
      'Compare three simple product ideas (bracelets, cookies, dog-walking) based on cost to make, how much people would pay, and how much time each takes.',
    category: 'SIMULATIONS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 14,
  },
  {
    name: 'Simulation: Running a Simple Budget',
    slug: 'simulation-running-a-simple-budget',
    description:
      'Manage a small starting budget across supplies, marketing flyers, and savings, then see how your choices affect your profit at the end of the month.',
    category: 'SIMULATIONS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 15,
  },
];

// ---------------------------------------------------------------------------
// FINANCIAL LITERACY CONCEPTS
// ---------------------------------------------------------------------------
const financialLiteracyConcepts = [
  // MONEY_BASICS
  {
    name: 'What Is Money For?',
    slug: 'what-is-money-for',
    description:
      'Money is a tool people use to trade for things they need or want, instead of swapping goods directly. It represents value that can be saved, spent, or exchanged.',
    category: 'MONEY_BASICS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 1,
  },
  {
    name: 'Coins, Bills, and Digital Money',
    slug: 'coins-bills-and-digital-money',
    description:
      'Money can be physical, like coins and bills, or digital, like the balance in a bank app or a gift card — all of it represents the same kind of value.',
    category: 'MONEY_BASICS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 2,
  },
  {
    name: 'Earning Money',
    slug: 'earning-money',
    description:
      'People earn money by working, doing chores, selling something, or providing a service — money is usually a reward for effort or something of value provided to others.',
    category: 'MONEY_BASICS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 3,
  },
  {
    name: 'What Is a Bank Account?',
    slug: 'what-is-a-bank-account',
    description:
      'A bank account is a safe place to keep money that a bank looks after for you. Savings accounts can even add a little extra money over time, called interest.',
    category: 'MONEY_BASICS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 4,
  },
  {
    name: 'Understanding Interest',
    slug: 'understanding-interest',
    description:
      'Interest is extra money a bank pays you for saving with them, or extra money you must pay back if you borrow — over time, interest can add up a lot.',
    category: 'MONEY_BASICS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 5,
  },

  // SAVING
  {
    name: 'Why Save Money?',
    slug: 'why-save-money',
    description:
      'Saving means keeping some money instead of spending it right away, so you have it later for something bigger, or for an emergency.',
    category: 'SAVING',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 6,
  },
  {
    name: 'Setting a Savings Goal',
    slug: 'setting-a-savings-goal',
    description:
      'A savings goal is a specific amount you want to save for something specific, like a bike or a game, and by a certain time — having a clear goal makes saving easier.',
    category: 'SAVING',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 7,
  },
  {
    name: 'The Power of Saving a Little Often',
    slug: 'power-of-saving-a-little-often',
    description:
      'Saving small amounts regularly — like a few coins every week — adds up to a large amount over months and years, thanks to consistency.',
    category: 'SAVING',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 8,
  },
  {
    name: 'Emergency Funds',
    slug: 'emergency-funds',
    description:
      'An emergency fund is money set aside for unexpected costs, like a broken bike or a surprise expense, so you are not caught without options.',
    category: 'SAVING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 9,
  },
  {
    name: 'Short-Term vs. Long-Term Saving',
    slug: 'short-term-vs-long-term-saving',
    description:
      'Short-term saving is for things you want soon, like a toy next month. Long-term saving is for bigger goals years away, like a car or college.',
    category: 'SAVING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 10,
  },

  // BUDGETING
  {
    name: 'What Is a Budget?',
    slug: 'what-is-a-budget',
    description:
      'A budget is a simple plan for your money that shows how much you have, and how you plan to spend, save, and share it.',
    category: 'BUDGETING',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 11,
  },
  {
    name: 'The Save-Spend-Share Plan',
    slug: 'save-spend-share-plan',
    description:
      'A simple way for kids to budget: split any money you get into three jars or categories — some to save, some to spend now, and some to share or give.',
    category: 'BUDGETING',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 12,
  },
  {
    name: 'Tracking What You Spend',
    slug: 'tracking-what-you-spend',
    description:
      'Writing down what you spend money on, even small amounts, helps you see where your money actually goes and spot habits you might want to change.',
    category: 'BUDGETING',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 13,
  },
  {
    name: 'Making a Monthly Budget',
    slug: 'making-a-monthly-budget',
    description:
      'A monthly budget lists money coming in (allowance, gifts, earnings) and money planned to go out (spending, saving), balanced so you do not run out.',
    category: 'BUDGETING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 14,
  },
  {
    name: 'Adjusting a Budget When Things Change',
    slug: 'adjusting-a-budget-when-things-change',
    description:
      'A good budget is flexible — if you earn less one month or have an extra cost, you adjust categories rather than abandoning the plan altogether.',
    category: 'BUDGETING',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 15,
  },

  // NEEDS_VS_WANTS
  {
    name: 'Needs vs. Wants',
    slug: 'needs-vs-wants',
    description:
      'A need is something you must have to live and be healthy, like food, water, and shelter. A want is something nice to have but not essential, like a new video game.',
    category: 'NEEDS_VS_WANTS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 16,
  },
  {
    name: 'Sorting Everyday Items Into Needs and Wants',
    slug: 'sorting-items-needs-and-wants',
    description:
      'Practice deciding whether things like school supplies, candy, a winter coat, and a toy are needs or wants — some items can be both, depending on the situation.',
    category: 'NEEDS_VS_WANTS',
    ageAppropriate: AgeBand.AGE_8_9,
    order: 17,
  },
  {
    name: 'Making Trade-Off Decisions',
    slug: 'making-trade-off-decisions',
    description:
      'Because money is limited, choosing to buy one thing often means giving up another — this is called a trade-off, and thinking it through leads to smarter choices.',
    category: 'NEEDS_VS_WANTS',
    ageAppropriate: AgeBand.AGE_10_11,
    order: 18,
  },
  {
    name: 'Avoiding Impulse Spending',
    slug: 'avoiding-impulse-spending',
    description:
      'Impulse spending means buying something suddenly without thinking it through. Waiting a day before a non-essential purchase often reveals if you really want it.',
    category: 'NEEDS_VS_WANTS',
    ageAppropriate: AgeBand.AGE_12_14,
    order: 19,
  },
];

async function seedAILiteracyConcepts() {
  let created = 0;
  let updated = 0;

  for (const concept of aiLiteracyConcepts) {
    const existing = await prisma.aILiteracyConcept.findUnique({
      where: { slug: concept.slug },
    });

    if (existing) {
      await prisma.aILiteracyConcept.update({
        where: { id: existing.id },
        data: concept,
      });
      updated++;
    } else {
      await prisma.aILiteracyConcept.create({ data: concept });
      created++;
    }

    console.log(`✅ [AI] ${concept.name} [${concept.category}] (${concept.ageAppropriate})`);
  }

  console.log(`\n📊 AI Literacy Summary: Created ${created}, Updated ${updated}, Total ${aiLiteracyConcepts.length}\n`);
}

async function seedEntrepreneurshipConcepts() {
  let created = 0;
  let updated = 0;

  for (const concept of entrepreneurshipConcepts) {
    const existing = await prisma.entrepreneurshipConcept.findUnique({
      where: { slug: concept.slug },
    });

    if (existing) {
      await prisma.entrepreneurshipConcept.update({
        where: { id: existing.id },
        data: concept,
      });
      updated++;
    } else {
      await prisma.entrepreneurshipConcept.create({ data: concept });
      created++;
    }

    console.log(`✅ [ENT] ${concept.name} [${concept.category}] (${concept.ageAppropriate})`);
  }

  console.log(`\n📊 Entrepreneurship Summary: Created ${created}, Updated ${updated}, Total ${entrepreneurshipConcepts.length}\n`);
}

async function seedFinancialLiteracyConcepts() {
  let created = 0;
  let updated = 0;

  for (const concept of financialLiteracyConcepts) {
    const existing = await prisma.financialLiteracyConcept.findUnique({
      where: { slug: concept.slug },
    });

    if (existing) {
      await prisma.financialLiteracyConcept.update({
        where: { id: existing.id },
        data: concept,
      });
      updated++;
    } else {
      await prisma.financialLiteracyConcept.create({ data: concept });
      created++;
    }

    console.log(`✅ [FIN] ${concept.name} [${concept.category}] (${concept.ageAppropriate})`);
  }

  console.log(`\n📊 Financial Literacy Summary: Created ${created}, Updated ${updated}, Total ${financialLiteracyConcepts.length}\n`);
}

async function main() {
  console.log('🚀 Seeding cross-curricular concepts (AI Literacy, Entrepreneurship, Financial Literacy)...\n');

  await seedAILiteracyConcepts();
  await seedEntrepreneurshipConcepts();
  await seedFinancialLiteracyConcepts();

  console.log('🎉 Cross-curricular concepts seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Cross-curricular seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
