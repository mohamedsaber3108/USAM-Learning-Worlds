/**
 * Misconception Engine v1 — seed data.
 *
 * Each entry is a REAL, pedagogically-documented common wrong-answer
 * pattern for math/English at the age band this app targets (roughly
 * grades 3-8 / ages 8-14). These are matched by `matchesTag` (a stand-in
 * for a QuestionTemplate/Activity's underlying skill, since we don't yet
 * have per-question tagging) plus `wrongAnswerValue`, which is compared
 * (normalized) against the learner's submitted wrong answer.
 *
 * This is intentionally a signature LIBRARY, not tied to a specific
 * question bank id — MisconceptionService uses `matchesTag` +
 * `wrongAnswerValue` to recognize a submitted wrong answer as an instance
 * of a known misconception regardless of which exact question surfaced
 * it, then records/increments a MisconceptionPattern row scoped to the
 * actual questionTemplateId/activityId that was answered.
 */

export interface MisconceptionSignature {
  /** Human-readable skill/topic tag, matched loosely against stem/content text. */
  matchesTag: string;
  /** The exact (normalized) wrong answer string that signals this misconception. */
  wrongAnswerValue: string;
  /** Plain-language description of the likely misconception. */
  description: string;
}

export const MISCONCEPTION_SEED_SIGNATURES: MisconceptionSignature[] = [
  {
    matchesTag: 'fraction-addition',
    wrongAnswerValue: '2/5',
    description:
      "Adds numerators and denominators straight across (1/2 + 1/3 -> 2/5) instead of finding a common denominator.",
  },
  {
    matchesTag: 'fraction-comparison',
    wrongAnswerValue: '1/4 > 1/3',
    description:
      'Believes a larger denominator means a larger fraction (treats denominators like whole numbers), so picks 1/4 as bigger than 1/3.',
  },
  {
    matchesTag: 'decimal-comparison',
    wrongAnswerValue: '0.25 > 0.3',
    description:
      "Compares decimals by digit count/whole-number intuition ('25 > 3') instead of place value, so thinks 0.25 is bigger than 0.3.",
  },
  {
    matchesTag: 'order-of-operations',
    wrongAnswerValue: '20',
    description:
      "For 2 + 3 x 4, computes strictly left-to-right (2+3=5, 5x4=20) instead of applying multiplication before addition (correct: 14).",
  },
  {
    matchesTag: 'negative-number-subtraction',
    wrongAnswerValue: '-2',
    description:
      "For 5 - (-3), drops one of the negative signs (treats it like 5 - 3) instead of adding (correct: 8).",
  },
  {
    matchesTag: 'multiplication-by-zero-or-one',
    wrongAnswerValue: '7',
    description:
      "For 7 x 0, confuses the zero property of multiplication with the identity property, answering 7 (as if multiplying by 1) instead of 0.",
  },
  {
    matchesTag: 'perimeter-area-confusion',
    wrongAnswerValue: 'area value',
    description:
      'Confuses perimeter and area formulas — multiplies side lengths (area formula) when asked for perimeter, or adds sides when asked for area.',
  },
  {
    matchesTag: 'percent-of-number',
    wrongAnswerValue: 'moves decimal wrong direction',
    description:
      "For 'what is 10% of 50', divides 50 by 10 in the wrong place-value direction or confuses percent with the literal digits, common wrong answer of 500 (multiplies instead of taking a tenth).",
  },
  {
    matchesTag: 'subject-verb-agreement',
    wrongAnswerValue: 'the dogs is running',
    description:
      "Matches the verb to the noun closest to it or defaults to singular 'is' regardless of subject number, instead of agreeing with the true (plural) subject.",
  },
  {
    matchesTag: 'homophone-confusion',
    wrongAnswerValue: "their/there/they're mixed up",
    description:
      "Classic homophone substitution — uses 'their' for 'there' (or vice versa) because they sound identical, not tracking the grammatical role (possessive vs. location vs. contraction).",
  },
];
