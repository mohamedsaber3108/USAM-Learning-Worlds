/**
 * Hallucination Control Service
 *
 * Closes the "AI Hallucination Control" gap flagged in
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md ("no RAG/retrieval/
 * citation/grounding/refusal-policy layer ... no teacher-escalation
 * trigger"). This is deliberately NOT a RAG/citation pipeline (that
 * remains a separate, larger, honestly-deferred gap - see RAG Engine row).
 * It is two small, real things:
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
 */

import { Injectable } from '@nestjs/common';

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

@Injectable()
export class HallucinationControlService {
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
