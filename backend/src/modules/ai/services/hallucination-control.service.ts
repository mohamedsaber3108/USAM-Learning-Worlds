/**
 * Hallucination Control Service
 *
 * Closes the "AI Hallucination Control" gap flagged in
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md ("no RAG/retrieval/
 * citation/grounding/refusal-policy layer ... no teacher-escalation
 * trigger tied to low-confidence answers"). This is deliberately NOT a
 * RAG/citation pipeline (that remains a separate, larger,
 * honestly-deferred gap - see RAG Engine row). It is three small, real
 * things:
 *
 * 1. A keyword-based off-topic detector: compares free-text learner
 *    input against the real scope keywords of their current mission/
 *    activity/topic (plus a small domain-vocabulary allowlist per
 *    coaching service). When the input shares no real overlap with that
 *    scope AND looks like a genuine question/request, it is flagged
 *    off-topic and the caller can short-circuit to a deterministic
 *    teacher-escalation hedge WITHOUT even spending an AI call.
 * 2. A confidence/uncertainty framing instruction appended to the
 *    existing coaching system prompts, so that even when the detector
 *    doesn't fire (ambiguous cases), the AI itself is instructed to
 *    hedge ("I'm not fully sure, let's check with a teacher") rather
 *    than confidently answering outside the learner's current
 *    mission/activity content scope.
 * 3. NEW (v1 low-confidence escalation): a deterministic hedging-language
 *    detector run against the AI's OWN generated answer (not the
 *    learner's input). If the model's response reads as
 *    low-confidence/hedged ("I'm not sure", "I think it might be",
 *    "don't quote me on this", etc.) on what looks like a factual/
 *    educational question, that is a real signal the answer may be
 *    unreliable. Previously the shaky answer was simply returned to the
 *    child as-is - nothing detected this or routed it anywhere. Now
 *    `flagLowConfidenceIfNeeded()` detects it, swaps in the safe teacher-
 *    escalation hedge instead of the shaky answer, and persists a real,
 *    actionable `SafetyEscalation` record (reusing the same model/queue
 *    built for character-safety escalations, with a new
 *    `triggerReason` = 'LOW_CONFIDENCE_ANSWER' category) so a
 *    moderator/teacher can review what the AI almost said and why.
 */

import { Injectable, Logger } from '@nestjs/common';
import { SafetyEscalationService } from './safety-escalation.service';

export interface OffTopicCheckResult {
  offTopic: boolean;
  matchedKeywords: string[];
  reason: string;
}

/** The exact hedge line the AI is instructed to use, and that the
 * deterministic short-circuit path also returns verbatim - kept
 * consistent so learners/parents see the same phrasing either way. */
export const TEACHER_ESCALATION_HEDGE =
  "I'm not fully sure about that one - it's outside what we're working on right now. Let's check with a teacher or grown-up to get a good answer!";

/** Common English stopwords stripped before keyword-overlap comparison. */
const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','to','of','and','or','but','if','in','on','at',
  'for','with','about','as','by','from','that','this','it','its','i','you','your','my','me','we','us','they',
  'what','who','why','how','when','where','can','could','would','should','do','does','did','will','not','no',
  'so','just','like','get','got','have','has','had','some','any','all','than','then','there','here','tell',
  'know','think','want','please','also','very','really','okay','ok','hi','hey','hello',
]);

/** Result of scanning an AI-generated answer for low-confidence signals. */
export interface LowConfidenceCheckResult {
  lowConfidence: boolean;
  matchedPhrases: string[];
}

/**
 * Deterministic hedging-language patterns commonly used by LLMs to
 * self-signal uncertainty ("I'm not sure", "I think it might be...",
 * "don't quote me on this", "as far as I know", etc). Rule-based, not an
 * LLM judgment call - same "deterministic pattern match over raw text"
 * approach already used by CharacterSafetyService for parent-bypass/
 * dependency-risk detection, applied here to the AI's own output instead
 * of the learner's.
 */
const HEDGING_PATTERNS: RegExp[] = [
  /i'?m not (fully |totally |100% |completely )?sure/i,
  /i (don'?t|do not) (fully |really )?know( for sure)?/i,
  /i think (it|this|that) (might|may|could) be/i,
  /(it|this) (might|may) (be|not be)/i,
  /don'?t quote me on (this|that)/i,
  /as far as i know/i,
  /i'?m (a bit |kind of |somewhat )?uncertain/i,
  /i could be wrong/i,
  /correct me if i'?m wrong/i,
  /not (entirely|completely|totally) certain/i,
  /i'?m (just |only )?guessing/i,
  /take this with a grain of salt/i,
  /i believe(,)? but i'?m not certain/i,
  /it'?s hard to say (for sure|exactly)/i,
];

/**
 * Heuristic signal that a learner's question is factual/educational
 * (vs. small talk/greetings) - i.e. the class of question where a
 * confidently-wrong answer is actually risky. Deliberately broad/
 * permissive: false positives here just mean an extra (harmless) check,
 * false negatives mean a shaky answer slips through, so err toward
 * catching more.
 */
const FACTUAL_QUESTION_PATTERN =
  /\b(what|why|when|where|who|which|how (many|much|does|do|is|are)|is it true|explain|define)\b/i;

@Injectable()
export class HallucinationControlService {
  private readonly logger = new Logger(HallucinationControlService.name);

  constructor(private safetyEscalation: SafetyEscalationService) {}

  /**
   * Scan an AI-generated answer for deterministic hedging-language
   * patterns. This runs on the model's OWN output, not the learner's
   * input - it is the self-reported-confidence heuristic requested for
   * the v1 low-confidence escalation mechanism (no structured
   * "confidence" field is returned by the current Bedrock prompts, so
   * hedging language in the free-text response is used as the proxy
   * signal instead).
   */
  checkLowConfidenceAnswer(answerText: string): LowConfidenceCheckResult {
    if (!answerText) {
      return { lowConfidence: false, matchedPhrases: [] };
    }
    const matched = HEDGING_PATTERNS.filter((p) => p.test(answerText)).map(
      (p) => p.source,
    );
    return { lowConfidence: matched.length > 0, matchedPhrases: matched };
  }

  /**
   * Heuristic check for whether a learner's question looks
   * factual/educational (the class of question a hedged, possibly-wrong
   * answer is actually risky for - as opposed to small talk, where a
   * hedge is harmless).
   */
  looksLikeFactualQuestion(text: string): boolean {
    if (!text) return false;
    return FACTUAL_QUESTION_PATTERN.test(text) || text.trim().endsWith('?');
  }

  /**
   * v1 low-confidence-answer escalation: the real behavioral fix this
   * gap needed. Given the learner's question and the AI's proposed
   * answer, decide whether the answer is a low-confidence response to a
   * factual/educational question. If so:
   *  - persist a real, actionable SafetyEscalation record (reusing the
   *    same model/queue built for character-safety escalations, with a
   *    new triggerReason category: 'LOW_CONFIDENCE_ANSWER') so a
   *    moderator/teacher can review the flagged Q&A, and
   *  - return the safe teacher-escalation hedge to use INSTEAD of the
   *    shaky answer.
   * If the answer is confident (or the question isn't factual-looking),
   * returns null and the caller should return the original answer
   * unchanged. Never throws into the caller's response path - escalation
   * persistence failures are logged, not propagated, matching the
   * existing CharacterSafetyService pattern.
   */
  async flagLowConfidenceIfNeeded(params: {
    learnerId: string;
    question: string;
    answerText: string;
    source: string; // e.g. 'english-coach.conversation', 'coding-coach.debug'
  }): Promise<{ hedge: string; matchedPhrases: string[] } | null> {
    const { learnerId, question, answerText, source } = params;

    const confidenceCheck = this.checkLowConfidenceAnswer(answerText);
    if (!confidenceCheck.lowConfidence) {
      return null;
    }
    if (!this.looksLikeFactualQuestion(question)) {
      return null;
    }

    try {
      await this.safetyEscalation.createEscalation({
        learnerId,
        triggerReason: `LOW_CONFIDENCE_ANSWER (${source}): matched hedging patterns [${confidenceCheck.matchedPhrases.join(', ')}] on question: "${question.slice(0, 200)}"`,
        safetyState: 'low_confidence_answer',
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to create SafetyEscalation for low-confidence answer (learner ${learnerId}, source ${source}): ${error?.message}`,
      );
    }

    return { hedge: TEACHER_ESCALATION_HEDGE, matchedPhrases: confidenceCheck.matchedPhrases };
  }

  /**
   * Tokenize free text into lowercase content words (stopwords/short
   * tokens removed).
   */
  private tokenize(text: string): string[] {
    return (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter(
      (t) => t.length >= 3 && !STOPWORDS.has(t),
    );
  }

  /**
   * Build the scope keyword set for a given coaching context: the
   * learner's current mission/activity title/type (real content data,
   * not fabricated), plus any extra topic/subject-specific terms the
   * caller supplies (e.g. programming language, CEFR topic, concept
   * name), plus a small fixed domain vocabulary so normal on-subject
   * chat ("what's a loop?", "how do verbs work?") isn't false-flagged.
   */
  buildScopeKeywords(
    context: {
      currentMission?: { title?: string };
      currentActivity?: { type?: string };
    },
    extra: Array<string | undefined | null>,
    domainVocabulary: string[],
  ): Set<string> {
    const keywords = new Set<string>();

    if (context?.currentMission?.title) {
      this.tokenize(context.currentMission.title).forEach((t) => keywords.add(t));
    }
    if (context?.currentActivity?.type) {
      this.tokenize(context.currentActivity.type).forEach((t) => keywords.add(t));
    }
    extra.filter(Boolean).forEach((s) => this.tokenize(s as string).forEach((t) => keywords.add(t)));
    domainVocabulary.forEach((t) => keywords.add(t.toLowerCase()));

    return keywords;
  }

  /**
   * Decide whether a learner's free-text message is off-topic relative
   * to the given scope keyword set. Deliberately conservative: short
   * messages (greetings, "ok", "yes") are never flagged, and ANY
   * keyword overlap counts as on-topic. Only flags messages that (a)
   * read like a real question/request (>= 4 content words, or contains
   * "?") and (b) share zero overlap with the scope.
   */
  checkOffTopic(text: string, scopeKeywords: Set<string>): OffTopicCheckResult {
    const tokens = this.tokenize(text);

    if (tokens.length === 0) {
      return { offTopic: false, matchedKeywords: [], reason: 'no_content_words' };
    }

    const matched = tokens.filter((t) => scopeKeywords.has(t));
    if (matched.length > 0) {
      return { offTopic: false, matchedKeywords: matched, reason: 'scope_match' };
    }

    const looksLikeQuestion = text.includes('?') || tokens.length >= 4;
    if (!looksLikeQuestion) {
      return { offTopic: false, matchedKeywords: [], reason: 'too_short_to_flag' };
    }

    return { offTopic: true, matchedKeywords: [], reason: 'no_scope_overlap' };
  }

  /**
   * The confidence/uncertainty framing block appended to coaching
   * system/user prompts. Instructs the AI to hedge rather than
   * confidently answer when a question falls outside the learner's
   * current mission/activity content scope.
   */
  getPromptGuardrail(): string {
    return `CONFIDENCE & SCOPE GUARDRAIL:
- Only answer confidently about topics inside this mission/activity's subject area.
- If the learner asks something outside that scope, or something you are not confident is correct, do NOT guess or make up an answer.
- Instead, say something like: "${TEACHER_ESCALATION_HEDGE}"
- It's always okay to say you're not fully sure - that's more trustworthy than a confident wrong answer.`;
  }
}
