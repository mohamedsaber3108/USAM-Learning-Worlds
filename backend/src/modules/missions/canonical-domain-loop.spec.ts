import { runCanonicalDomainLoop } from './testing/canonical-domain-loop.harness';

/**
 * Canonical shared-spine regression contract.
 *
 * Every domain that plugs into the shared learning engine is verified with the
 * SAME parameterized loop (START→ACTIVITY→ATTEMPT→EVIDENCE→MASTERY→REVIEW→
 * RECOMMENDATION) via the REAL ActivityEvaluator + MasteryConfidenceAlgorithm.
 *
 * English fixtures mirror seed-english-vocabulary-slice.ts (proven live).
 * Coding fixtures mirror the CODE activity shape the evaluator expects
 * ({ requiredKeywords } in content, { code } in the response). Add AI /
 * Creativity / Critical Thinking here as each domain is wired in.
 */

// ─── English / Vocabulary A1 (SELECT → KNOWLEDGE) ──────────────────────────
runCanonicalDomainLoop({
  domain: 'English / Vocabulary A1 (SELECT)',
  missionId: 'english-mission-everyday-words',
  learnerId: 'LEARNER_EN',
  expectedCompetency: 'english-competency-everyday-words-a1',
  expectedEvidenceType: 'KNOWLEDGE',
  activity: {
    id: 'english-act-everyday-fruit',
    type: 'SELECT',
    assessmentPurpose: 'FORMATIVE',
    content: {
      question: 'Which word is a fruit?',
      options: ['apple', 'chair', 'river', 'happy'],
      correctAnswers: ['apple'],
    },
  },
  correctResponse: { selectedAnswers: ['apple'] },
  incorrectResponse: { selectedAnswers: ['chair'] },
});

// ─── English / Vocabulary A1 (MATCH → APPLICATION, SUMMATIVE) ───────────────
runCanonicalDomainLoop({
  domain: 'English / Vocabulary A1 (MATCH, summative)',
  missionId: 'english-mission-everyday-words',
  learnerId: 'LEARNER_EN',
  expectedCompetency: 'english-competency-everyday-words-a1',
  expectedEvidenceType: 'APPLICATION',
  activity: {
    id: 'english-act-everyday-match',
    type: 'MATCH',
    assessmentPurpose: 'SUMMATIVE',
    content: {
      pairs: [
        { left: 'sun', right: 'the bright light in the sky' },
        { left: 'book', right: 'pages with words you read' },
        { left: 'water', right: 'what you drink when you are thirsty' },
      ],
    },
  },
  correctResponse: {
    matches: [
      { left: 'sun', right: 'the bright light in the sky' },
      { left: 'book', right: 'pages with words you read' },
      { left: 'water', right: 'what you drink when you are thirsty' },
    ],
  },
  incorrectResponse: {
    matches: [
      { left: 'sun', right: 'pages with words you read' },
      { left: 'book', right: 'the bright light in the sky' },
      { left: 'water', right: 'what you drink when you are thirsty' },
    ],
  },
});

// ─── AI Literacy (SELECT → KNOWLEDGE) ──────────────────────────────────────
runCanonicalDomainLoop({
  domain: 'AI Literacy / What is AI (SELECT)',
  missionId: 'ai-mission-meet-ai',
  learnerId: 'LEARNER_AI',
  expectedCompetency: 'ai-competency-what-is-ai',
  expectedEvidenceType: 'KNOWLEDGE',
  activity: {
    id: 'ai-act-what-is-ai',
    type: 'SELECT',
    assessmentPurpose: 'FORMATIVE',
    content: {
      question: 'What is artificial intelligence (AI)?',
      options: [
        'A computer program that learns from examples to make guesses',
        'A living robot that thinks and feels like a person',
        'Magic inside the computer',
        'A kind of video game',
      ],
      correctAnswers: ['A computer program that learns from examples to make guesses'],
    },
  },
  correctResponse: { selectedAnswers: ['A computer program that learns from examples to make guesses'] },
  incorrectResponse: { selectedAnswers: ['Magic inside the computer'] },
});

// ─── Creativity (CREATE → CREATION) ────────────────────────────────────────
runCanonicalDomainLoop({
  domain: 'Creativity / Brainstorming (CREATE)',
  missionId: 'creativity-mission-idea-spark',
  learnerId: 'LEARNER_CREATE',
  expectedCompetency: 'creativity-competency-brainstorming',
  expectedEvidenceType: 'CREATION',
  activity: {
    id: 'creativity-act-brainstorm-uses',
    type: 'CREATE',
    assessmentPurpose: 'SUMMATIVE',
    content: {
      prompt: 'Think of at least 3 creative uses for a paperclip.',
      rubric: ['At least 3 ideas', 'Ideas are different', 'At least one unusual idea'],
    },
  },
  correctResponse: { submission: 'hook, bookmark, zipper pull, tiny antenna, lock pick' },
  incorrectResponse: {},
});

// ─── Coding (CODE → CREATION) ──────────────────────────────────────────────
// Fixture mirrors the evaluator's CODE contract: content.requiredKeywords must
// all appear in response.code. This is the harness-level (evaluator) proof; the
// full live sandbox-execution loop for Coding is verified separately (task #6).
runCanonicalDomainLoop({
  domain: 'Coding / first concept (CODE)',
  missionId: 'coding-mission-loop-fixture',
  learnerId: 'LEARNER_CODE',
  expectedCompetency: 'coding-competency-fixture',
  expectedEvidenceType: 'CREATION',
  activity: {
    id: 'coding-act-print-loop',
    type: 'CODE',
    assessmentPurpose: 'FORMATIVE',
    content: {
      prompt: 'Print the numbers 1 to 3 using a loop.',
      requiredKeywords: ['for', 'print'],
    },
  },
  correctResponse: { code: 'for i in range(1, 4):\n    print(i)' },
  incorrectResponse: { code: 'x = 5' },
});
