/**
 * Word Error Rate (WER) — the standard ASR accuracy metric (audit T-P1-9).
 *
 * WER = (Substitutions + Insertions + Deletions) / (words in reference),
 * computed from the Levenshtein edit distance between the reference and
 * hypothesis word sequences. Lower is better; 0 = perfect, and it can
 * exceed 1 when the hypothesis is much longer/wronger than the reference.
 *
 * Arabic note: we normalize before scoring so cosmetic differences
 * (diacritics/tashkeel, tatweel, alef/hamza and ya/alef-maqsura variants,
 * punctuation) don't inflate WER for what is really a correct transcription.
 */

/** Normalize an Arabic (or mixed) string for fair WER comparison. */
export function normalizeArabic(text: string): string {
  return (text || '')
    .normalize('NFKC')
    // Remove tashkeel (harakat) and the superscript alef.
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Remove tatweel (kashida).
    .replace(/\u0640/g, '')
    // Normalize alef variants (أ إ آ ا) -> ا
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // Normalize alef maqsura (ى) -> ya (ي)
    .replace(/\u0649/g, '\u064A')
    // Normalize teh marbuta (ة) -> heh (ه)
    .replace(/\u0629/g, '\u0647')
    // Strip most punctuation (Arabic + Latin).
    .replace(/[.,!?؟،؛:"'()\[\]{}«»\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function tokenize(text: string): string[] {
  const n = normalizeArabic(text);
  return n.length ? n.split(' ') : [];
}

export interface WerResult {
  wer: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  referenceWords: number;
}

/**
 * Compute WER between a reference and a hypothesis transcript using
 * word-level Levenshtein alignment with backtracking to count S/I/D.
 */
export function wordErrorRate(reference: string, hypothesis: string): WerResult {
  const ref = tokenize(reference);
  const hyp = tokenize(hypothesis);

  const n = ref.length;
  const m = hyp.length;

  // dp[i][j] = min edits to turn ref[0..i) into hyp[0..j)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution/match
      );
    }
  }

  // Backtrack to attribute edits to S/I/D.
  let i = n;
  let j = m;
  let substitutions = 0;
  let insertions = 0;
  let deletions = 0;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1] === hyp[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      i--; j--; // match
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      substitutions++; i--; j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      insertions++; j--;
    } else {
      deletions++; i--;
    }
  }

  const wer = n === 0 ? (m === 0 ? 0 : 1) : (substitutions + insertions + deletions) / n;
  return { wer, substitutions, insertions, deletions, referenceWords: n };
}
