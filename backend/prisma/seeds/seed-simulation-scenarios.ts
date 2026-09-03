/**
 * Simulation Engine seed — real, curriculum-aligned branching decision
 * scenarios per SimulationCategory. Each scenario has a short branching
 * tree of decision nodes with 2-3 real choice options and an outcome
 * note, not placeholder lorem-ipsum. Ages/domain follow the inventory's
 * ENTREPRENEURSHIP / FINANCIAL_LITERACY / DIGITAL_SAFETY / SCIENCE / CIVIC
 * categories.
 */
import { PrismaClient, AgeBand, SimulationCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface NodeSpec {
  nodeKey: string;
  prompt: string;
  isEnding: boolean;
  outcomeNote?: string;
  choiceOptions: { label: string; nextNode?: string }[];
}

interface ScenarioSpec {
  title: string;
  slug: string;
  category: SimulationCategory;
  description: string;
  ageAppropriate: AgeBand;
  startNodeKey: string;
  nodes: NodeSpec[];
}

const scenarios: ScenarioSpec[] = [
  {
    title: 'Lemonade Stand Startup',
    slug: 'lemonade-stand-startup',
    category: SimulationCategory.ENTREPRENEURSHIP,
    description: 'Run a small lemonade stand for a week and make real business decisions about pricing, supplies, and marketing.',
    ageAppropriate: AgeBand.AGE_8_9,
    startNodeKey: 'start',
    nodes: [
      {
        nodeKey: 'start',
        prompt: 'You have $10 to start your lemonade stand. Lemons cost $4 for a bag, sugar cups cost $2, and a poster costs $1. What do you buy first?',
        isEnding: false,
        choiceOptions: [
          { label: 'Buy lemons and sugar', nextNode: 'day1_good_supply' },
          { label: 'Buy a big poster to attract customers', nextNode: 'day1_poster_first' },
        ],
      },
      {
        nodeKey: 'day1_good_supply',
        prompt: 'You have great lemonade but no sign, so few people notice your stand. Only 3 people stop by. What now?',
        isEnding: false,
        choiceOptions: [
          { label: 'Make a quick handwritten sign', nextNode: 'day2_recover' },
          { label: 'Lower your price to attract people', nextNode: 'day2_price_cut' },
        ],
      },
      {
        nodeKey: 'day1_poster_first',
        prompt: 'Your poster brings 10 people, but you only have enough lemons for 5 cups. Several customers leave disappointed.',
        isEnding: false,
        choiceOptions: [
          { label: 'Ask a parent to help buy more lemons', nextNode: 'day2_restock' },
          { label: 'Apologize and note names for tomorrow', nextNode: 'day2_notes' },
        ],
      },
      {
        nodeKey: 'day2_recover',
        prompt: 'Your handwritten sign works! Sales double. By week end you earned $18 profit.',
        isEnding: true,
        outcomeNote: 'You learned that marketing (even a simple sign) matters as much as having a good product.',
        choiceOptions: [],
      },
      {
        nodeKey: 'day2_price_cut',
        prompt: 'Lower prices bring a few more customers, but you barely break even because each cup earns less.',
        isEnding: true,
        outcomeNote: 'Cutting price without more customers can shrink your profit — visibility mattered more than price here.',
        choiceOptions: [],
      },
      {
        nodeKey: 'day2_restock',
        prompt: 'With more lemons, you serve everyone the next day and earn $22 profit for the week.',
        isEnding: true,
        outcomeNote: 'Planning inventory to match demand (from the poster) turned a rough start into a strong finish.',
        choiceOptions: [],
      },
      {
        nodeKey: 'day2_notes',
        prompt: 'You collect names but don\'t restock — several people don\'t return. You end the week with a small $6 profit.',
        isEnding: true,
        outcomeNote: 'Good intentions without action (restocking) meant missed sales — planning ahead matters.',
        choiceOptions: [],
      },
    ],
  },
  {
    title: 'Save or Spend: Birthday Money',
    slug: 'save-or-spend-birthday-money',
    category: SimulationCategory.FINANCIAL_LITERACY,
    description: 'You received $30 for your birthday. Make real decisions about saving, spending, and setting goals.',
    ageAppropriate: AgeBand.AGE_10_11,
    startNodeKey: 'start',
    nodes: [
      {
        nodeKey: 'start',
        prompt: 'You have $30. A new game costs $25. A savings account at your local bank pays a little extra over time. What do you do?',
        isEnding: false,
        choiceOptions: [
          { label: 'Buy the game now', nextNode: 'bought_game' },
          { label: 'Save $20 and spend $10 on something small', nextNode: 'saved_some' },
        ],
      },
      {
        nodeKey: 'bought_game',
        prompt: 'You enjoy the game for a few weeks, but then a friend invites you to a paid event and you have no money saved.',
        isEnding: true,
        outcomeNote: 'Spending everything at once feels good immediately but leaves nothing for opportunities that come up later.',
        choiceOptions: [],
      },
      {
        nodeKey: 'saved_some',
        prompt: 'Two months later, your $20 has grown a little from interest, and you also had $10 to enjoy right away.',
        isEnding: true,
        outcomeNote: 'Splitting money between saving and spending balances enjoying today with being ready for tomorrow.',
        choiceOptions: [],
      },
    ],
  },
  {
    title: 'The Stranger Online',
    slug: 'the-stranger-online',
    category: SimulationCategory.DIGITAL_SAFETY,
    description: 'Someone you don\'t know messages you in a game chat. Practice safe decisions about sharing information online.',
    ageAppropriate: AgeBand.AGE_8_9,
    startNodeKey: 'start',
    nodes: [
      {
        nodeKey: 'start',
        prompt: 'A player you don\'t recognize messages you: "You\'re really good! What school do you go to?" What do you do?',
        isEnding: false,
        choiceOptions: [
          { label: 'Tell them your school name', nextNode: 'shared_info' },
          { label: 'Say "I don\'t share personal info online" and tell a trusted adult', nextNode: 'safe_choice' },
        ],
      },
      {
        nodeKey: 'shared_info',
        prompt: 'The stranger keeps asking more personal questions, like where you live.',
        isEnding: true,
        outcomeNote: 'Sharing one detail can lead to requests for more. Rule of thumb: never share your school, address, or full name with people you only know online.',
        choiceOptions: [],
      },
      {
        nodeKey: 'safe_choice',
        prompt: 'You block the request politely and tell a parent, who is proud of how you handled it.',
        isEnding: true,
        outcomeNote: 'You correctly recognized a personal-info request from a stranger and used the safe response: decline + tell a trusted adult.',
        choiceOptions: [],
      },
    ],
  },
  {
    title: 'The Missing Plant Nutrient',
    slug: 'the-missing-plant-nutrient',
    category: SimulationCategory.SCIENCE,
    description: 'Design a fair experiment to figure out why one plant is growing poorly while others thrive.',
    ageAppropriate: AgeBand.AGE_10_11,
    startNodeKey: 'start',
    nodes: [
      {
        nodeKey: 'start',
        prompt: 'One plant in your garden is yellow and small while the rest are green and tall. All get the same water and sunlight. What do you test first?',
        isEnding: false,
        choiceOptions: [
          { label: 'Test the soil for nutrients', nextNode: 'test_soil' },
          { label: 'Just add more water', nextNode: 'add_water' },
        ],
      },
      {
        nodeKey: 'test_soil',
        prompt: 'The soil test shows low nitrogen. You add compost with nitrogen and track growth over 2 weeks with a control plant that gets no compost.',
        isEnding: true,
        outcomeNote: 'You used the scientific method correctly: identify a variable (nitrogen), test it, and use a control plant to confirm the cause before concluding.',
        choiceOptions: [],
      },
      {
        nodeKey: 'add_water',
        prompt: 'Extra water doesn\'t help — the plant gets worse because the real issue (soil nutrients) was never addressed.',
        isEnding: true,
        outcomeNote: 'Changing a variable without first identifying the actual cause wastes time — testing before acting is the scientific approach.',
        choiceOptions: [],
      },
    ],
  },
  {
    title: 'Speaking Up for a Classmate',
    slug: 'speaking-up-for-a-classmate',
    category: SimulationCategory.CIVIC,
    description: 'You see a classmate being excluded from a group activity. Practice civic courage and fair decision-making.',
    ageAppropriate: AgeBand.AGE_12_14,
    startNodeKey: 'start',
    nodes: [
      {
        nodeKey: 'start',
        prompt: 'During group work, you notice one classmate is being left out of the conversation by two others. What do you do?',
        isEnding: false,
        choiceOptions: [
          { label: 'Invite the classmate into the discussion directly', nextNode: 'included' },
          { label: 'Say nothing to avoid conflict', nextNode: 'stayed_quiet' },
        ],
      },
      {
        nodeKey: 'included',
        prompt: 'The classmate shares a great idea that improves the group\'s project. The teacher notices the more inclusive teamwork.',
        isEnding: true,
        outcomeNote: 'Small acts of inclusion can surface good ideas that would otherwise be lost, and model fair participation for the group.',
        choiceOptions: [],
      },
      {
        nodeKey: 'stayed_quiet',
        prompt: 'The classmate stays quiet the rest of the project and their good ideas never get shared.',
        isEnding: true,
        outcomeNote: 'Staying silent when someone is excluded doesn\'t cause the exclusion, but speaking up is a real, low-cost way to make participation fairer.',
        choiceOptions: [],
      },
    ],
  },
];

async function main() {
  for (const spec of scenarios) {
    const scenario = await prisma.simulationScenario.upsert({
      where: { slug: spec.slug },
      update: {
        title: spec.title,
        category: spec.category,
        description: spec.description,
        ageAppropriate: spec.ageAppropriate,
      },
      create: {
        title: spec.title,
        slug: spec.slug,
        category: spec.category,
        description: spec.description,
        ageAppropriate: spec.ageAppropriate,
      },
    });

    for (const node of spec.nodes) {
      await prisma.simulationDecisionPoint.upsert({
        where: { scenarioId_nodeKey: { scenarioId: scenario.id, nodeKey: node.nodeKey } },
        update: {
          prompt: node.prompt,
          isEnding: node.isEnding,
          outcomeNote: node.outcomeNote,
          choiceOptions: node.choiceOptions as any,
        },
        create: {
          scenarioId: scenario.id,
          nodeKey: node.nodeKey,
          prompt: node.prompt,
          isEnding: node.isEnding,
          outcomeNote: node.outcomeNote,
          choiceOptions: node.choiceOptions as any,
        },
      });
    }

    await prisma.simulationScenario.update({
      where: { id: scenario.id },
      data: { startNodeId: spec.startNodeKey },
    });

    console.log(`Seeded scenario: ${spec.title} (${spec.nodes.length} nodes)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
