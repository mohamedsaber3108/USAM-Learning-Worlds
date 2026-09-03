/**
 * Picks which character companion accompanies a mission run.
 *
 * IMPORTANT — checked backend/prisma/schema.prisma `model Mission` before
 * writing this: there is NO `characterId`/`companionId` column on Mission
 * (only `worldId`, `type`, `title`, `description`, `estimatedMinutes`,
 * `order`). So there is no per-mission assigned companion to read from the
 * API today. Rather than inventing a fake field or leaving the mission
 * player companion-less, this derives a reasonable companion client-side:
 *
 *  1. If the mission's world/domain slug maps to one of the specialist
 *     mentors seeded in backend/prisma/seeds/seed-character-universe.ts
 *     (Codey for coding, Rami for science, Mira for arts/creativity, etc —
 *     the same subject associations already implied by their seeded
 *     personality/role), use that mentor.
 *  2. Otherwise fall back to Azouz (role: GUIDE), the one character
 *     always-unlocked and explicitly seeded as "the warm, familiar face
 *     that welcomes them back to the platform every single day" — the
 *     correct default companion for a generic mission run.
 *
 * If/when Mission gets a real companion/characterId column, swap this
 * function's body for a direct read — every consumer (MissionPlayerPage)
 * already just calls `getMissionCompanion(mission)` so no call-site changes
 * would be needed.
 */

const DOMAIN_SLUG_TO_CHARACTER: Record<string, string> = {
  technology: 'Codey',
  science: 'Rami',
  arts: 'Mira',
  creativity: 'Mira',
  'critical-thinking': 'Faris',
  'social-studies': 'Zara',
  language: 'Luma',
  engineering: 'Codey',
  mathematics: 'Faris',
}

export interface MissionCompanionInput {
  world?: { domain?: { slug?: string | null } | null; slug?: string | null } | null
  type?: string | null
}

/** Default, always-unlocked companion — the platform's core guide character. */
export const DEFAULT_COMPANION_NAME = 'Azouz'

export function getMissionCompanionName(mission?: MissionCompanionInput | null): string {
  const domainSlug = mission?.world?.domain?.slug ?? mission?.world?.slug
  if (domainSlug && DOMAIN_SLUG_TO_CHARACTER[domainSlug]) {
    return DOMAIN_SLUG_TO_CHARACTER[domainSlug]
  }
  // CHALLENGE-type missions read naturally as Rex's (CHALLENGER) territory.
  if (mission?.type === 'CHALLENGE') {
    return 'Rex'
  }
  return DEFAULT_COMPANION_NAME
}

/** Short, personality-flavored reaction lines per companion + moment. Kept
 * intentionally brief (Duolingo-style single-line encouragement, not a
 * paragraph) and non-judgmental on wrong answers — coaches toward retrying,
 * never mocks. */
type Moment = 'correct' | 'incorrect' | 'streak' | 'start' | 'complete'

const LINES: Record<string, Partial<Record<Moment, string[]>>> = {
  Azouz: {
    start: ["Let's figure this one out together.", "Ready when you are!"],
    correct: ['Nice work — that was spot on!', "Yes! You've got it."],
    incorrect: ["Not quite — let's look again.", 'Close! Try another angle.'],
    streak: ["You're on a roll!", 'Three in a row — keep going!'],
    complete: ['Great mission, well earned!', "That's a wrap — nicely done."],
  },
  Codey: {
    start: ['Time to debug this problem.', "Let's ship this one."],
    correct: ['Clean logic — that compiles!', 'Exactly right.'],
    incorrect: ['Bug found — give it another pass.', "Almost — check your logic."],
    streak: ['Solid streak, no bugs in sight!', 'Running smooth!'],
    complete: ['Mission committed. Nice build!', 'Deployed! Great work.'],
  },
  Rami: {
    start: ["Let's run the experiment.", 'Hypothesis time!'],
    correct: ['Hypothesis confirmed!', 'Exactly the right result.'],
    incorrect: ['Interesting result — retest?', "That's not it, but good try."],
    streak: ['Your data is looking great!', 'Consistent results — nice!'],
    complete: ['Experiment complete. Great findings!', 'Lab work done well.'],
  },
  Mira: {
    start: ["Let's create something great.", 'Blank canvas, big ideas.'],
    correct: ['Beautiful — that works perfectly.', 'Yes! Great instinct.'],
    incorrect: ["Not quite the shade — try again.", 'Almost there, keep exploring.'],
    streak: ["You're finding your style!", 'Creative streak going strong!'],
    complete: ['A masterpiece finished!', 'Beautifully done.'],
  },
  Faris: {
    start: ['A puzzle worth solving.', "Let's crack this."],
    correct: ['Solved it — sharp thinking!', 'Correct, well reasoned.'],
    incorrect: ['Not the right piece — try again.', "Close, but rethink it."],
    streak: ['Puzzle streak — impressive!', "You're on fire!"],
    complete: ['Puzzle mastered!', 'Case closed — nice work.'],
  },
  Rex: {
    start: ['Think you can beat this?', 'Bring your best.'],
    correct: ['Fast AND right — respect.', "That's the move."],
    incorrect: ["Not this time — come back stronger.", 'Miss! Reset and go again.'],
    streak: ["Can't stop you today!", 'Unstoppable streak!'],
    complete: ['Challenge cleared. Good round!', 'GG — solid mission.'],
  },
  Zara: {
    start: ['Every mission is a story.', "Let's write this chapter."],
    correct: ['A perfect plot twist!', 'Exactly as the story goes.'],
    incorrect: ['Plot hole — try again.', 'Not quite the right ending.'],
    streak: ['The story keeps building!', 'A great chapter streak!'],
    complete: ['A story well told!', 'The end — nicely written.'],
  },
  Luma: {
    start: ["Let's practice together.", 'Ready to communicate clearly?'],
    correct: ['Perfectly said!', 'Yes — clear and correct.'],
    incorrect: ["Almost — let's rephrase.", 'Not quite, try once more.'],
    streak: ['Your words are flowing!', 'Great streak of clarity!'],
    complete: ['Well spoken, mission complete!', 'Lovely work today.'],
  },
}

export function getCompanionLine(characterName: string, moment: Moment): string {
  const pool = LINES[characterName]?.[moment] ?? LINES[DEFAULT_COMPANION_NAME]?.[moment] ?? ['']
  // noUncheckedIndexedAccess makes array indexing return `T | undefined` —
  // pool is always non-empty (falls back to ['']), but fall back to '' again
  // for TypeScript's benefit rather than a non-null assertion.
  return pool[Math.floor(Math.random() * pool.length)] ?? ''
}
