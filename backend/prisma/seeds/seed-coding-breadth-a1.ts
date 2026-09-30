/**
 * Coding curriculum BREADTH — wave 1, post-reconciliation content phase.
 *
 * Scales the CANONICAL `coding` domain (the one the mastery graph +
 * /coding/learner/progress use) beyond the single proven "Loops (intro)"
 * vertical slice. This is CONTENT on the already-proven shared spine — NOT a
 * new engine or a new architectural slice.
 *
 * The proven Loops slice lives at domain=coding → skill(Programming
 * Fundamentals) → competency(Loops intro). This wave adds the remaining
 * priority coding strands as real gradeable competencies:
 *   - Computational Thinking (reasoning, no syntax) — SEQUENCE + SELECT
 *   - Variables & Output (Python)                    — CODE
 *   - Making Decisions / Conditionals (Python)       — CODE
 *   - Functions (Python)                             — CODE
 *   - Debugging: Fix the Broken Code (Python)        — CODE
 *   - Mini Project: Build a Small Program (Python)   — CODE capstone
 *
 * CODE activities carry coding-test-model v1 (`testModelVersion:1`, language,
 * runner, tests[]) and are graded by the coding-sandbox path: the learner's
 * browser runs the code (Pyodide) + tests, reports {id, passed, actual}, and
 * the SERVER re-validates `actual` against the spec (gradeAgainstSpec) →
 * CREATION evidence → Mastery → Review. Hidden tests keep the learner from
 * hardcoding to the visible example (their expected value is stripped from the
 * spec the API serves, held server-side for re-validation).
 *
 * HONESTY: this is the FORMATIVE trust tier (browser execution, server
 * re-validation) — sufficient for practice + formative mastery, NOT
 * credential-grade. executionPolicy is recorded on the evidence so credential
 * logic can distinguish it later. Reasoning activities (SEQUENCE/SELECT) are
 * graded by the shared ActivityEvaluator, not the sandbox.
 *
 * PROD-SAFE idempotent upserts with fixed ids; self-sufficient skill/competency
 * upserts. Run: npm run seed:coding:breadth
 */
import { PrismaClient, ActivityType, DifficultyLevel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'coding';

interface SkillDef {
  slug: string;
  name: string;
  description: string;
  order: number;
}
interface ActivityDef {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  assessmentPurpose: 'FORMATIVE' | 'SUMMATIVE';
  content: Prisma.InputJsonValue;
}
interface CompetencyDef {
  skill: SkillDef;
  competencyId: string;
  competencyName: string;
  competencyDescription: string;
  objectiveId: string;
  objectiveName: string;
  objectiveDescription: string;
  missionId: string;
  missionTitle: string;
  missionDescription: string;
  activities: ActivityDef[];
}

const PROGRAMMING_FUNDAMENTALS: SkillDef = {
  slug: 'coding-programming-fundamentals',
  name: 'Programming Fundamentals',
  description: 'Core building blocks of programming.',
  order: 1,
};
const COMPUTATIONAL_THINKING: SkillDef = {
  slug: 'coding-computational-thinking',
  name: 'Computational Thinking',
  description: 'Think like a problem-solver: break problems down, spot patterns, and plan clear steps.',
  order: 2,
};
const PROBLEM_SOLVING: SkillDef = {
  slug: 'coding-problem-solving',
  name: 'Problem Solving & Debugging',
  description: 'Find and fix problems, and build small programs from start to finish.',
  order: 3,
};

// COMPUTATIONAL THINKING — reasoning, no syntax (graded by ActivityEvaluator).
const COMP_THINKING: CompetencyDef = {
  skill: COMPUTATIONAL_THINKING,
  competencyId: 'coding-competency-computational-thinking',
  competencyName: 'Think in steps (computational thinking)',
  competencyDescription: 'Break a task into ordered steps and spot the repeating pattern.',
  objectiveId: 'coding-objective-computational-thinking',
  objectiveName: 'Plan clear ordered steps',
  objectiveDescription: 'Sequence the steps of a task and identify patterns before coding.',
  missionId: 'coding-mission-computational-thinking',
  missionTitle: 'Think Like a Coder',
  missionDescription: 'Break problems into steps and spot patterns with Codey — no code yet!',
  activities: [
    {
      id: 'coding-act-ct-sequence-sandwich',
      type: ActivityType.SEQUENCE,
      title: 'Put the steps in order',
      description: 'Order the steps of a simple algorithm.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'A computer follows steps exactly, in order. Put these steps to make toast in the right order.',
        context: 'An algorithm is an ordered list of steps. Order matters — you cannot spread butter before the toast is made!',
        items: ['Put butter on the toast', 'Put bread in the toaster', 'Turn the toaster on', 'Take out the toast'],
        correctOrder: ['Put bread in the toaster', 'Turn the toaster on', 'Take out the toast', 'Put butter on the toast'],
      },
    },
    {
      id: 'coding-act-ct-pattern',
      type: ActivityType.SELECT,
      title: 'What comes next in the pattern?',
      description: 'Spot the repeating pattern.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'A robot repeats: forward, forward, turn. forward, forward, turn. What are the next two moves?',
        context: 'Spotting a repeating pattern lets you predict what comes next — and loops in code repeat patterns like this.',
        keyPoints: ['The pattern repeats every 3 moves', 'After a turn it starts with forward, forward'],
        options: ['forward, forward', 'turn, turn', 'forward, turn', 'turn, forward'],
        correctAnswers: ['forward, forward'],
      },
    },
    {
      id: 'coding-act-ct-decompose',
      type: ActivityType.SELECT,
      title: 'Break the problem down',
      description: 'Choose the best way to split a big task.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        question: 'You want to program a game. Which is the BEST first step (decomposition)?',
        context: 'Decomposition means breaking one big problem into smaller pieces you can solve one at a time.',
        keyPoints: ['Break the big problem into small parts', 'Solve one small part at a time'],
        options: [
          'Split it into smaller parts: player, score, and levels',
          'Write the whole game in one go',
          'Give up because it is too big',
          'Copy someone else\'s finished game',
        ],
        correctAnswers: ['Split it into smaller parts: player, score, and levels'],
      },
    },
  ],
};

// VARIABLES & OUTPUT (Python) — CODE.
const VARIABLES_OUTPUT: CompetencyDef = {
  skill: PROGRAMMING_FUNDAMENTALS,
  competencyId: 'coding-competency-variables-output',
  competencyName: 'Variables & output',
  competencyDescription: 'Store values in variables and print them out.',
  objectiveId: 'coding-objective-variables-output',
  objectiveName: 'Use variables and print()',
  objectiveDescription: 'Create variables, give them values, and print results.',
  missionId: 'coding-mission-variables-output',
  missionTitle: 'Store and Show',
  missionDescription: 'Learn to store values in variables and print them with Codey.',
  activities: [
    {
      id: 'coding-act-var-what-is-variable',
      type: ActivityType.SELECT,
      title: 'What is a variable?',
      description: 'Choose the best description of a variable.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'What is a variable in a program?',
        context: 'A variable is a labelled box that stores a value you can use and change later.',
        keyPoints: ['A variable stores a value', 'It has a name so you can use it again'],
        options: [
          'A named box that stores a value',
          'A kind of loop',
          'A drawing on the screen',
          'A mistake in the code',
        ],
        correctAnswers: ['A named box that stores a value'],
      },
    },
    {
      id: 'coding-act-var-print-greeting',
      type: ActivityType.CODE,
      title: 'Store a name and greet it',
      description: 'Make a variable and print a greeting.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'Create a variable name set to "Codey", then print exactly: Hello, Codey!',
        context:
          'Store text in a variable: name = "Codey". Then print a greeting using it, for example: print("Hello, " + name + "!"). Text values go in quotes.',
        starterCode: '# make a variable called name, then print the greeting\n',
        sampleSolution: 'name = "Codey"\nprint("Hello, " + name + "!")',
        tests: [
          {
            id: 'greet-stdout',
            description: 'Prints "Hello, Codey!"',
            kind: 'stdout-equals',
            expectedOutput: 'Hello, Codey!',
          },
          {
            id: 'greet-has-name',
            description: 'The greeting includes the name',
            hidden: true,
            kind: 'stdout-contains',
            expectedOutput: 'Codey',
          },
        ],
      },
    },
    {
      id: 'coding-act-var-add-two',
      type: ActivityType.CODE,
      title: 'Add two numbers',
      description: 'Store two numbers and print their sum.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'Store the numbers 7 and 5 in two variables, then print their sum (it should print 12).',
        context:
          'Numbers do NOT need quotes. Make a = 7 and b = 5, then print(a + b). Adding two number variables gives their total.',
        starterCode: '# store 7 and 5, then print their sum\n',
        sampleSolution: 'a = 7\nb = 5\nprint(a + b)',
        tests: [
          {
            id: 'sum-stdout',
            description: 'Prints 12',
            kind: 'stdout-equals',
            expectedOutput: '12',
          },
        ],
      },
    },
  ],
};

// CONDITIONALS (Python) — CODE.
const CONDITIONALS: CompetencyDef = {
  skill: PROGRAMMING_FUNDAMENTALS,
  competencyId: 'coding-competency-conditionals',
  competencyName: 'Making decisions (if / else)',
  competencyDescription: 'Use if/else so a program can make choices.',
  objectiveId: 'coding-objective-conditionals',
  objectiveName: 'Branch with if/else',
  objectiveDescription: 'Write conditions that choose between two outcomes.',
  missionId: 'coding-mission-conditionals',
  missionTitle: 'Making Choices',
  missionDescription: 'Teach your program to make decisions with if and else, with Codey.',
  activities: [
    {
      id: 'coding-act-cond-which-keyword',
      type: ActivityType.SELECT,
      title: 'Which keyword makes a decision?',
      description: 'Pick the decision keyword.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'Which keyword lets a program choose to do something only when a condition is true?',
        context: 'if runs code only when a condition is true. else runs when it is false.',
        keyPoints: ['if = do this when true', 'else = otherwise do this'],
        options: ['if', 'print', 'for', 'name'],
        correctAnswers: ['if'],
      },
    },
    {
      id: 'coding-act-cond-pass-fail',
      type: ActivityType.CODE,
      title: 'Pass or try again',
      description: 'Print Pass or Try again based on a score.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'A variable score is 80. If score is 60 or more, print "Pass". Otherwise print "Try again". (It should print Pass.)',
        context:
          'Use if score >= 60: then print "Pass", with an else: that prints "Try again". The : and the indented line under it are important in Python.',
        starterCode: 'score = 80\n# print "Pass" if score is 60 or more, otherwise "Try again"\n',
        sampleSolution: 'score = 80\nif score >= 60:\n    print("Pass")\nelse:\n    print("Try again")',
        tests: [
          {
            id: 'pass-stdout',
            description: 'Prints Pass for a score of 80',
            kind: 'stdout-equals',
            expectedOutput: 'Pass',
          },
        ],
      },
    },
    {
      id: 'coding-act-cond-even-odd',
      type: ActivityType.CODE,
      title: 'Even or odd checker',
      description: 'Write a function that says if a number is even or odd.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'Write a function even_or_odd(n) that returns "even" if n is even and "odd" if n is odd.',
        context:
          'A number is even when it divides by 2 with no remainder. In Python, n % 2 == 0 is true for even numbers. Return "even" or "odd" from inside the function.',
        starterCode: 'def even_or_odd(n):\n    # return "even" or "odd"\n    pass\n',
        sampleSolution:
          'def even_or_odd(n):\n    if n % 2 == 0:\n        return "even"\n    else:\n        return "odd"\n',
        tests: [
          {
            id: 'even-4',
            description: 'even_or_odd(4) returns "even"',
            kind: 'function-call',
            functionName: 'even_or_odd',
            args: [4],
            expectedReturn: 'even',
          },
          {
            id: 'odd-7',
            description: 'even_or_odd(7) returns "odd"',
            hidden: true,
            kind: 'function-call',
            functionName: 'even_or_odd',
            args: [7],
            expectedReturn: 'odd',
          },
        ],
      },
    },
  ],
};

// FUNCTIONS (Python) — CODE.
const FUNCTIONS: CompetencyDef = {
  skill: PROGRAMMING_FUNDAMENTALS,
  competencyId: 'coding-competency-functions',
  competencyName: 'Functions',
  competencyDescription: 'Write reusable functions that take inputs and return results.',
  objectiveId: 'coding-objective-functions',
  objectiveName: 'Define and return from functions',
  objectiveDescription: 'Create functions with parameters that return the right value.',
  missionId: 'coding-mission-functions',
  missionTitle: 'Build a Machine',
  missionDescription: 'Write your own functions — little machines that take an input and give a result, with Codey.',
  activities: [
    {
      id: 'coding-act-func-what-returns',
      type: ActivityType.SELECT,
      title: 'What does return do?',
      description: 'Choose what return does in a function.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'In a function, what does "return" do?',
        context: 'return sends a value back out of the function so the rest of the program can use it.',
        keyPoints: ['return gives a value back', 'The caller can use the returned value'],
        options: [
          'Sends a value back out of the function',
          'Prints text to the screen',
          'Starts a loop',
          'Deletes the function',
        ],
        correctAnswers: ['Sends a value back out of the function'],
      },
    },
    {
      id: 'coding-act-func-triple',
      type: ActivityType.CODE,
      title: 'The tripler',
      description: 'Write a function that triples a number.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'Write a function triple(x) that returns x times 3.',
        context: 'Define it with def triple(x): and inside, return x * 3. Calling triple(4) should give 12.',
        starterCode: 'def triple(x):\n    # return x times 3\n    pass\n',
        sampleSolution: 'def triple(x):\n    return x * 3\n',
        tests: [
          {
            id: 'triple-4',
            description: 'triple(4) returns 12',
            kind: 'function-call',
            functionName: 'triple',
            args: [4],
            expectedReturn: 12,
          },
          {
            id: 'triple-0',
            description: 'triple(0) returns 0',
            hidden: true,
            kind: 'function-call',
            functionName: 'triple',
            args: [0],
            expectedReturn: 0,
          },
        ],
      },
    },
    {
      id: 'coding-act-func-greet',
      type: ActivityType.CODE,
      title: 'The greeter',
      description: 'Write a function that builds a greeting.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'Write a function greet(name) that returns "Hi, " followed by the name. So greet("Sam") returns "Hi, Sam".',
        context: 'Use def greet(name): and return "Hi, " + name. Joining text with + is called concatenation.',
        starterCode: 'def greet(name):\n    # return "Hi, " and the name\n    pass\n',
        sampleSolution: 'def greet(name):\n    return "Hi, " + name\n',
        tests: [
          {
            id: 'greet-sam',
            description: 'greet("Sam") returns "Hi, Sam"',
            kind: 'function-call',
            functionName: 'greet',
            args: ['Sam'],
            expectedReturn: 'Hi, Sam',
          },
        ],
      },
    },
  ],
};

// DEBUGGING (Python) — CODE. Fix the broken code.
const DEBUGGING: CompetencyDef = {
  skill: PROBLEM_SOLVING,
  competencyId: 'coding-competency-debugging',
  competencyName: 'Debugging: fix the broken code',
  competencyDescription: 'Read code, find the mistake, and fix it so the tests pass.',
  objectiveId: 'coding-objective-debugging',
  objectiveName: 'Find and fix bugs',
  objectiveDescription: 'Locate a bug in short code and correct it.',
  missionId: 'coding-mission-debugging',
  missionTitle: 'Bug Hunt',
  missionDescription: 'Find the mistake in the code and fix it so it works, with Codey.',
  activities: [
    {
      id: 'coding-act-debug-what-is-bug',
      type: ActivityType.SELECT,
      title: 'What is a bug?',
      description: 'Choose the best description of a bug.',
      difficulty: DifficultyLevel.EASY,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'In programming, what is a "bug"?',
        context: 'A bug is a mistake in the code that makes the program do the wrong thing.',
        keyPoints: ['A bug is a mistake in the code', 'Debugging means finding and fixing it'],
        options: [
          'A mistake in the code that makes it work wrongly',
          'A type of insect in the computer',
          'A kind of variable',
          'A finished, correct program',
        ],
        correctAnswers: ['A mistake in the code that makes it work wrongly'],
      },
    },
    {
      id: 'coding-act-debug-fix-print',
      type: ActivityType.CODE,
      title: 'Fix the greeting',
      description: 'The code should print Hello but it is broken. Fix it.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'This program should print exactly: Hello. Fix the bug so it does.',
        context:
          'Look carefully at the starter code. In Python, text you print must be inside quotes. Find what is missing and fix it.',
        starterCode: 'print(Hello)\n',
        sampleSolution: 'print("Hello")\n',
        tests: [
          {
            id: 'hello-stdout',
            description: 'Prints Hello',
            kind: 'stdout-equals',
            expectedOutput: 'Hello',
          },
        ],
      },
    },
    {
      id: 'coding-act-debug-fix-sum',
      type: ActivityType.CODE,
      title: 'Fix the adder',
      description: 'The function should add two numbers but returns the wrong thing. Fix it.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt: 'add(a, b) should RETURN the sum of a and b. The starter code has a bug — fix it so add(2, 3) returns 5.',
        context:
          'The starter code subtracts instead of adds, and it prints instead of returns. A function must use return to give a value back. Fix both problems.',
        starterCode: 'def add(a, b):\n    print(a - b)\n',
        sampleSolution: 'def add(a, b):\n    return a + b\n',
        tests: [
          {
            id: 'add-2-3',
            description: 'add(2, 3) returns 5',
            kind: 'function-call',
            functionName: 'add',
            args: [2, 3],
            expectedReturn: 5,
          },
          {
            id: 'add-10-1',
            description: 'add(10, 1) returns 11',
            hidden: true,
            kind: 'function-call',
            functionName: 'add',
            args: [10, 1],
            expectedReturn: 11,
          },
        ],
      },
    },
  ],
};

// MINI PROJECT (Python) — CODE capstone.
const MINI_PROJECT: CompetencyDef = {
  skill: PROBLEM_SOLVING,
  competencyId: 'coding-competency-mini-project',
  competencyName: 'Mini project: build a small program',
  competencyDescription: 'Combine variables, loops, and functions into one small working program.',
  objectiveId: 'coding-objective-mini-project',
  objectiveName: 'Build a small complete program',
  objectiveDescription: 'Write a function that solves a small multi-step problem end to end.',
  missionId: 'coding-mission-mini-project',
  missionTitle: 'My First Program (Project)',
  missionDescription: 'Put it all together — variables, a loop, and a function — in your own mini coding project with Codey.',
  activities: [
    {
      id: 'coding-act-project-plan',
      type: ActivityType.SEQUENCE,
      title: 'Plan your program',
      description: 'Order the steps to build the counting program.',
      difficulty: DifficultyLevel.MEDIUM,
      assessmentPurpose: 'FORMATIVE',
      content: {
        question: 'You will write a function that adds up the numbers 1 to n. Put the plan in order.',
        context: 'Plan before you code: start a total, loop and add each number, then return the total.',
        items: ['Return the total', 'Start a total at 0', 'Loop over the numbers and add each to the total'],
        correctOrder: ['Start a total at 0', 'Loop over the numbers and add each to the total', 'Return the total'],
      },
    },
    {
      id: 'coding-act-project-sum-to-n',
      type: ActivityType.CODE,
      title: 'Build the sum-to-n program',
      description: 'Write a function that sums the numbers from 1 to n.',
      difficulty: DifficultyLevel.HARD,
      assessmentPurpose: 'SUMMATIVE',
      content: {
        testModelVersion: 1,
        language: 'python',
        runner: 'pyodide',
        executionPolicy: 'FORMATIVE',
        timeoutMs: 8000,
        prompt:
          'This is your mini project! Write a function sum_to(n) that returns the sum of all whole numbers from 1 to n. For example sum_to(5) returns 15 (1+2+3+4+5).',
        context:
          'Use everything you have learned: start total = 0, loop with for i in range(1, n + 1):, add each i to total, then return total. Test it in your head with sum_to(3) = 6.',
        starterCode: 'def sum_to(n):\n    # start a total, loop and add, then return the total\n    pass\n',
        sampleSolution:
          'def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total = total + i\n    return total\n',
        tests: [
          {
            id: 'sum-to-5',
            description: 'sum_to(5) returns 15',
            kind: 'function-call',
            functionName: 'sum_to',
            args: [5],
            expectedReturn: 15,
          },
          {
            id: 'sum-to-1',
            description: 'sum_to(1) returns 1',
            kind: 'function-call',
            functionName: 'sum_to',
            args: [1],
            expectedReturn: 1,
          },
          {
            id: 'sum-to-10',
            description: 'sum_to(10) returns 55',
            hidden: true,
            kind: 'function-call',
            functionName: 'sum_to',
            args: [10],
            expectedReturn: 55,
          },
        ],
      },
    },
  ],
};

const COMPETENCIES: CompetencyDef[] = [
  COMP_THINKING,
  VARIABLES_OUTPUT,
  CONDITIONALS,
  FUNCTIONS,
  DEBUGGING,
  MINI_PROJECT,
];

async function main() {
  console.log('Seeding Coding breadth (wave 1): computational thinking, variables, conditionals, functions, debugging, mini-project...');

  // Domain: Coding. NAME must stay exactly "Coding" (progress endpoint filters on it).
  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: { name: 'Coding' },
    create: {
      name: 'Coding',
      slug: DOMAIN_SLUG,
      description: 'Learn to code — variables, logic, loops, data, and more.',
      icon: 'Code',
      color: '#0ea5e9',
      order: 2,
    },
  });

  const codingWorld = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  let comps = 0;
  let acts = 0;

  for (const def of COMPETENCIES) {
    const skill = await prisma.skill.upsert({
      where: { slug: def.skill.slug },
      update: {},
      create: {
        domainId: domain.id,
        name: def.skill.name,
        slug: def.skill.slug,
        description: def.skill.description,
        order: def.skill.order,
      },
    });

    const competency = await prisma.competency.upsert({
      where: { id: def.competencyId },
      update: { name: def.competencyName, description: def.competencyDescription, skillId: skill.id },
      create: {
        id: def.competencyId,
        skillId: skill.id,
        name: def.competencyName,
        description: def.competencyDescription,
        order: 2,
      },
    });

    const objective = await prisma.learningObjective.upsert({
      where: { id: def.objectiveId },
      update: { name: def.objectiveName, description: def.objectiveDescription },
      create: {
        id: def.objectiveId,
        competencyId: competency.id,
        name: def.objectiveName,
        description: def.objectiveDescription,
        order: 1,
      },
    });

    const mission = await prisma.mission.upsert({
      where: { id: def.missionId },
      update: { worldId: codingWorld?.id ?? null, title: def.missionTitle, description: def.missionDescription },
      create: {
        id: def.missionId,
        worldId: codingWorld?.id ?? null,
        title: def.missionTitle,
        description: def.missionDescription,
        type: 'GUIDED',
        estimatedMinutes: 12,
        order: 1,
      },
    });

    for (const [index, a] of def.activities.entries()) {
      const activity = await prisma.activity.upsert({
        where: { id: a.id },
        update: { content: a.content, title: a.title, description: a.description },
        create: {
          id: a.id,
          objectiveId: objective.id,
          type: a.type,
          title: a.title,
          description: a.description,
          difficulty: a.difficulty,
          assessmentPurpose: a.assessmentPurpose,
          order: index,
          content: a.content,
        },
      });
      await prisma.missionActivity.upsert({
        where: { missionId_activityId: { missionId: mission.id, activityId: activity.id } },
        update: {},
        create: { missionId: mission.id, activityId: activity.id, order: index, isRequired: true },
      });
      acts += 1;
    }
    comps += 1;
    console.log(`  ✓ ${def.competencyName}  (skill=${def.skill.slug}, mission=${def.missionId}, activities=${def.activities.length})`);
  }

  console.log(`Coding breadth wave 1 seeded: competencies=${comps}, activities=${acts}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
