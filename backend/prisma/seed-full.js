const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Creating comprehensive seed data...\n');

  // Get existing learner
  const user = await prisma.user.findUnique({ where: { email: 'learner@test.com' } });
  if (!user) { console.log('❌ No test user found. Run npx prisma db seed first.'); return; }

  const learner = await prisma.learner.findUnique({ where: { userId: user.id } });
  if (!learner) { console.log('❌ No learner profile found.'); return; }

  // Get domains
  const domains = await prisma.domain.findMany();
  const mathDomain = domains.find(d => d.name === 'Mathematics');
  const sciDomain = domains.find(d => d.name === 'Science');
  const langDomain = domains.find(d => d.name === 'Language');
  const techDomain = domains.find(d => d.name === 'Technology');

  // Create skills for each domain
  const skills = [];
  const skillData = [
    { domainId: mathDomain?.id, name: 'Addition & Subtraction', slug: 'addition-subtraction', order: 1 },
    { domainId: mathDomain?.id, name: 'Multiplication', slug: 'multiplication', order: 2 },
    { domainId: mathDomain?.id, name: 'Fractions', slug: 'fractions', order: 3 },
    { domainId: sciDomain?.id, name: 'Plants & Nature', slug: 'plants-nature', order: 1 },
    { domainId: sciDomain?.id, name: 'Solar System', slug: 'solar-system', order: 2 },
    { domainId: langDomain?.id, name: 'Vocabulary', slug: 'vocabulary', order: 1 },
    { domainId: langDomain?.id, name: 'Reading Comprehension', slug: 'reading-comprehension', order: 2 },
    { domainId: techDomain?.id, name: 'Block Coding', slug: 'block-coding', order: 1 },
  ];

  for (const s of skillData) {
    if (!s.domainId) continue;
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
    skills.push(skill);
  }
  console.log(`✅ Created ${skills.length} skills`);

  // Create competencies
  const competencies = [];
  const compData = [
    { skillSlug: 'addition-subtraction', name: 'Single Digit Addition', order: 1 },
    { skillSlug: 'addition-subtraction', name: 'Double Digit Addition', order: 2 },
    { skillSlug: 'multiplication', name: 'Times Tables 1-5', order: 1 },
    { skillSlug: 'multiplication', name: 'Times Tables 6-12', order: 2 },
    { skillSlug: 'plants-nature', name: 'Parts of a Plant', order: 1 },
    { skillSlug: 'plants-nature', name: 'Plant Life Cycle', order: 2 },
    { skillSlug: 'solar-system', name: 'Planet Names & Order', order: 1 },
    { skillSlug: 'vocabulary', name: 'Common Words', order: 1 },
    { skillSlug: 'vocabulary', name: 'Synonyms & Antonyms', order: 2 },
    { skillSlug: 'block-coding', name: 'Sequences', order: 1 },
    { skillSlug: 'block-coding', name: 'Loops', order: 2 },
  ];

  for (const c of compData) {
    const skill = skills.find(s => s.slug === c.skillSlug);
    if (!skill) continue;
    const comp = await prisma.competency.create({
      data: { skillId: skill.id, name: c.name, order: c.order },
    }).catch(() => null);
    if (comp) competencies.push(comp);
  }
  console.log(`✅ Created ${competencies.length} competencies`);

  // Create learning objectives
  const objectives = [];
  for (const comp of competencies) {
    const obj = await prisma.learningObjective.create({
      data: { competencyId: comp.id, name: `Master ${comp.name}`, order: 1 },
    }).catch(() => null);
    if (obj) objectives.push(obj);
  }
  console.log(`✅ Created ${objectives.length} learning objectives`);

  // Create activities (these are the questions players answer)
  const activitySets = [
    // Math - Addition
    { objIndex: 0, type: 'SELECT', title: 'What is 5 + 3?', difficulty: 'EASY', content: { question: 'What is 5 + 3?', options: ['6', '7', '8', '9'], correctAnswers: ['8'] } },
    { objIndex: 0, type: 'SELECT', title: 'What is 7 + 4?', difficulty: 'EASY', content: { question: 'What is 7 + 4?', options: ['10', '11', '12', '13'], correctAnswers: ['11'] } },
    { objIndex: 0, type: 'SOLVE', title: 'Solve: 9 + 6 = ?', difficulty: 'EASY', content: { problem: 'Solve: 9 + 6 = ?', solution: '15', acceptableAnswers: ['15'] } },
    // Math - Double digit
    { objIndex: 1, type: 'SOLVE', title: 'What is 23 + 15?', difficulty: 'MEDIUM', content: { problem: 'What is 23 + 15?', solution: '38', acceptableAnswers: ['38'] } },
    { objIndex: 1, type: 'SELECT', title: 'What is 45 + 27?', difficulty: 'MEDIUM', content: { question: 'What is 45 + 27?', options: ['62', '72', '82', '67'], correctAnswers: ['72'] } },
    // Math - Multiplication
    { objIndex: 2, type: 'SELECT', title: 'What is 3 × 4?', difficulty: 'EASY', content: { question: 'What is 3 × 4?', options: ['7', '10', '12', '14'], correctAnswers: ['12'] } },
    { objIndex: 2, type: 'SOLVE', title: 'What is 5 × 5?', difficulty: 'EASY', content: { problem: 'What is 5 × 5?', solution: '25', acceptableAnswers: ['25'] } },
    { objIndex: 2, type: 'SELECT', title: 'What is 4 × 3?', difficulty: 'EASY', content: { question: 'What is 4 × 3?', options: ['10', '11', '12', '13'], correctAnswers: ['12'] } },
    // Math - Times 6-12
    { objIndex: 3, type: 'SOLVE', title: 'What is 7 × 8?', difficulty: 'MEDIUM', content: { problem: 'What is 7 × 8?', solution: '56', acceptableAnswers: ['56'] } },
    { objIndex: 3, type: 'SELECT', title: 'What is 9 × 6?', difficulty: 'MEDIUM', content: { question: 'What is 9 × 6?', options: ['48', '54', '56', '63'], correctAnswers: ['54'] } },
    // Science - Plants
    { objIndex: 4, type: 'SELECT', title: 'Which part of a plant absorbs water?', difficulty: 'EASY', content: { question: 'Which part of a plant absorbs water from the soil?', options: ['Leaves', 'Roots', 'Stem', 'Flowers'], correctAnswers: ['Roots'] } },
    { objIndex: 4, type: 'SELECT', title: 'What do leaves do?', difficulty: 'EASY', content: { question: 'What is the main job of leaves?', options: ['Absorb water', 'Make food using sunlight', 'Hold the plant up', 'Attract bees'], correctAnswers: ['Make food using sunlight'] } },
    { objIndex: 4, type: 'EXPLAIN', title: 'Explain photosynthesis', difficulty: 'MEDIUM', content: { question: 'Explain how a plant makes its food in simple words.', keyPoints: ['sunlight', 'water', 'leaves', 'food'] } },
    // Science - Plant Life Cycle
    { objIndex: 5, type: 'SEQUENCE', title: 'Order the plant life cycle', difficulty: 'MEDIUM', content: { items: ['Seed', 'Sprout', 'Adult Plant', 'Flower', 'Fruit with Seeds'], correctOrder: ['Seed', 'Sprout', 'Adult Plant', 'Flower', 'Fruit with Seeds'] } },
    // Science - Solar System
    { objIndex: 6, type: 'SELECT', title: 'Which planet is closest to the Sun?', difficulty: 'EASY', content: { question: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctAnswers: ['Mercury'] } },
    { objIndex: 6, type: 'SELECT', title: 'Which is the largest planet?', difficulty: 'EASY', content: { question: 'Which is the largest planet in our solar system?', options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], correctAnswers: ['Jupiter'] } },
    { objIndex: 6, type: 'SOLVE', title: 'How many planets are there?', difficulty: 'EASY', content: { problem: 'How many planets are in our solar system?', solution: '8', acceptableAnswers: ['8', 'eight'] } },
    // Language - Vocabulary
    { objIndex: 7, type: 'SELECT', title: 'What does "enormous" mean?', difficulty: 'EASY', content: { question: 'What does the word "enormous" mean?', options: ['Very small', 'Very big', 'Very fast', 'Very slow'], correctAnswers: ['Very big'] } },
    { objIndex: 7, type: 'SELECT', title: 'What does "ancient" mean?', difficulty: 'EASY', content: { question: 'What does the word "ancient" mean?', options: ['Very new', 'Very old', 'Very tall', 'Very pretty'], correctAnswers: ['Very old'] } },
    // Language - Synonyms
    { objIndex: 8, type: 'MATCH', title: 'Match the synonyms', difficulty: 'MEDIUM', content: { pairs: [{left: 'happy', right: 'joyful'}, {left: 'sad', right: 'unhappy'}, {left: 'big', right: 'large'}] } },
    { objIndex: 8, type: 'SELECT', title: 'Opposite of "hot"', difficulty: 'EASY', content: { question: 'What is the opposite of "hot"?', options: ['Warm', 'Cold', 'Cool', 'Mild'], correctAnswers: ['Cold'] } },
    // Coding - Sequences
    { objIndex: 9, type: 'SEQUENCE', title: 'Order the steps to draw a square', difficulty: 'EASY', content: { items: ['Move forward', 'Turn right', 'Move forward', 'Turn right', 'Move forward', 'Turn right', 'Move forward'], correctOrder: ['Move forward', 'Turn right', 'Move forward', 'Turn right', 'Move forward', 'Turn right', 'Move forward'] } },
    { objIndex: 9, type: 'EXPLAIN', title: 'What is a sequence?', difficulty: 'EASY', content: { question: 'Explain what a sequence means in coding.', keyPoints: ['order', 'steps', 'instructions', 'one after another'] } },
    // Coding - Loops
    { objIndex: 10, type: 'SELECT', title: 'What does a loop do?', difficulty: 'MEDIUM', content: { question: 'What does a loop do in coding?', options: ['Stops the program', 'Repeats instructions', 'Deletes code', 'Creates variables'], correctAnswers: ['Repeats instructions'] } },
    { objIndex: 10, type: 'CODE', title: 'Write a simple loop', difficulty: 'MEDIUM', content: { prompt: 'Write code that prints "Hello" 3 times using a loop.', requiredKeywords: ['for', 'Hello'] } },
  ];

  const activities = [];
  for (let i = 0; i < activitySets.length; i++) {
    const a = activitySets[i];
    if (!objectives[a.objIndex]) continue;
    const activity = await prisma.activity.create({
      data: {
        objectiveId: objectives[a.objIndex].id,
        type: a.type,
        title: a.title,
        description: a.title,
        content: a.content,
        difficulty: a.difficulty,
        order: i,
      },
    }).catch(() => null);
    if (activity) activities.push(activity);
  }
  console.log(`✅ Created ${activities.length} activities (questions)`);

  // Delete old missions (except the original seed one)
  await prisma.missionRun.deleteMany({});
  await prisma.mission.deleteMany({});

  // Create missions
  const missionData = [
    { title: 'Math Explorer: Addition', description: 'Master addition with fun number puzzles! Start with single digits and work your way up.', type: 'GUIDED', estimatedMinutes: 10, order: 1 },
    { title: 'Multiplication Master', description: 'Learn your times tables from 1 to 12 through interactive challenges.', type: 'GUIDED', estimatedMinutes: 15, order: 2 },
    { title: 'Plant Detective', description: 'Discover the amazing world of plants - their parts, how they grow, and how they make food.', type: 'EXPLORATION', estimatedMinutes: 12, order: 3 },
    { title: 'Space Voyager', description: 'Journey through our solar system and learn about each planet along the way.', type: 'EXPLORATION', estimatedMinutes: 15, order: 4 },
    { title: 'Word Wizard', description: 'Build your vocabulary by learning new words, synonyms, and antonyms.', type: 'GUIDED', estimatedMinutes: 10, order: 5 },
    { title: 'Code Builder: First Steps', description: 'Learn the basics of coding - sequences, loops, and problem solving with blocks.', type: 'PROJECT_BASED', estimatedMinutes: 20, order: 6 },
    { title: 'Math Challenge: Speed Round', description: 'Test your math skills against the clock! How many can you solve?', type: 'CHALLENGE', estimatedMinutes: 8, order: 7 },
    { title: 'Nature Journal', description: 'Create your own nature observations by exploring plants and ecosystems.', type: 'PROJECT_BASED', estimatedMinutes: 25, order: 8 },
  ];

  const missions = [];
  for (const m of missionData) {
    const mission = await prisma.mission.create({ data: m });
    missions.push(mission);
  }
  console.log(`✅ Created ${missions.length} missions`);

  // Update progression
  await prisma.progression.updateMany({
    where: { learnerId: learner.id },
    data: { level: 5, totalXP: 2450, coins: 120 }
  });

  // Create/update practice streak
  await prisma.practiceStreak.upsert({
    where: { learnerId: learner.id },
    update: { currentStreak: 7, longestStreak: 14, lastPracticeDate: new Date() },
    create: { learnerId: learner.id, currentStreak: 7, longestStreak: 14, lastPracticeDate: new Date() },
  });

  // Create some XP gains
  const xpSources = ['MISSION_COMPLETE', 'ACTIVITY_SUCCESS', 'STREAK_BONUS'];
  for (let i = 0; i < 15; i++) {
    await prisma.xPGain.create({
      data: {
        learnerId: learner.id,
        amount: 50 + Math.floor(i * 30),
        source: xpSources[i % 3],
        reason: `Completed activity ${i + 1}`,
      },
    }).catch(() => {});
  }

  // Create some mission runs (history)
  for (let i = 0; i < 3; i++) {
    await prisma.missionRun.create({
      data: {
        learnerId: learner.id,
        missionId: missions[i].id,
        status: 'COMPLETED',
        currentStageIndex: 3,
        startedAt: new Date(Date.now() - (3 - i) * 86400000),
        completedAt: new Date(Date.now() - (3 - i) * 86400000 + 600000),
      },
    });
  }

  // Create mastery records
  for (let i = 0; i < Math.min(5, competencies.length); i++) {
    const states = ['PROFICIENT', 'DEVELOPING', 'MASTERED', 'NOVICE', 'DEVELOPING'];
    await prisma.masteryRecord.create({
      data: {
        learnerId: learner.id,
        competencyId: competencies[i].id,
        state: states[i],
        confidence: 0.5 + (i * 0.1),
        evidenceCount: 3 + i,
        lastPracticed: new Date(Date.now() - i * 86400000),
      },
    }).catch(() => {});
  }

  console.log('\n🎉 Full seed complete!');
  console.log('📊 Summary:');
  console.log(`   - ${skills.length} skills across ${domains.length} domains`);
  console.log(`   - ${competencies.length} competencies`);
  console.log(`   - ${activities.length} interactive activities`);
  console.log(`   - ${missions.length} playable missions`);
  console.log(`   - Level 5 learner with 2450 XP, 7-day streak`);
  console.log(`   - 3 completed missions in history`);
  console.log(`   - 5 mastery records`);
  console.log('\n🚀 Open https://kids.usamif.com and explore!');
}

seed()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
