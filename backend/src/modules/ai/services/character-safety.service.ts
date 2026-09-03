/**
 * Character Safety Policy Layer
 *
 * A dedicated architectural layer for character-interaction safety,
 * distinct from (but built on top of) the generic ModerationService.
 *
 * Character conversations with children need a *policy* layer above raw
 * moderation because:
 *  - both directions of a conversation turn matter (what the child sent
 *    AND what the AI is about to say back)
 *  - some risk categories (parental-oversight bypass, emotional
 *    dependency) are specific to long-running character relationships
 *    and are not things a generic content moderator is tuned to catch
 *  - the caller (character.service.ts) needs a small, explicit set of
 *    states to branch on, not just a raw {flagged, severity} blob
 *
 * Per requirement, none of this is "ask the LLM if it's safe" - the
 * parent-bypass and emotional-dependency checks below are deterministic,
 * rule-based pattern matches over the raw text. They run in ADDITION to
 * (never instead of) ModerationService.moderateContent(), which itself is
 * already a two-layer check (Presidio deterministic PII pre-check OR'd
 * with a Bedrock LLM verdict).
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ModerationService, ModerationResult } from '../moderation.service';
import { SafetyEscalationService } from './safety-escalation.service';

/**
 * The 5 explicit character-safety states. Every evaluateSafety() call
 * resolves to exactly one of these - character.service.ts branches on
 * this enum, never on raw moderation internals.
 */
export type SafetyState =
  | 'safe'
  | 'restricted'
  | 'blocked'
  | 'escalation_required'
  | 'parent_approval_required';

export interface SafetyEvaluation {
  state: SafetyState;
  reasons: string[];
  allowResponse: boolean;
}

/**
 * Deterministic keyword/pattern signals for content asking a child to
 * bypass parental oversight ("don't tell your parents", "keep this a
 * secret from your mom/dad", etc). This is a distinct risk category the
 * generic moderator does not specifically model, so it gets its own
 * pattern set rather than being folded into severity mapping.
 */
const PARENT_BYPASS_PATTERNS: RegExp[] = [
  /don'?t tell (your )?(mom|dad|mum|mother|father|parents?|teacher|guardian)/i,
  /keep (this|it) (a )?secret (from|between us).{0,40}(mom|dad|mum|mother|father|parent)/i,
  /(don'?t|do not) (let|tell) (your )?(mom|dad|mum|mother|father|parents?) (know|find out)/i,
  /just between (you and me|us)[,.]? (don'?t|do not) (tell|say)/i,
  /this (stays|is) (just )?between (you and me|us)/i,
  /(no need|you don'?t need) to (tell|ask) (your )?(parents?|mom|dad)/i,
  /parents? (wouldn'?t|don'?t need to) (understand|know|find out)/i,
];

/**
 * Deterministic pattern set for emotional-dependency risk signals across
 * a conversation history. Simple, rule-based, code-level - explicitly NOT
 * an LLM judgment call, per spec.
 */
const DEPENDENCY_PHRASES: RegExp[] = [
  /you'?re my (only|best) friend/i,
  /you'?re the only one who (understands|cares|listens)/i,
  /i (don'?t|do not) have (any )?(other )?friends/i,
  /don'?t tell anyone (we|i) (talked|talk|spoke)/i,
  /i (can'?t|cannot) stop thinking about (you|talking to you)/i,
  /i wish you were (real|my real friend)/i,
  /please don'?t (leave|go|disappear)/i,
  /i love you more than/i,
];

const MAX_HEALTHY_SESSION_MINUTES = 45;
const MAX_HEALTHY_MESSAGES_PER_SESSION = 60;

@Injectable()
export class CharacterSafetyService {
  private readonly logger = new Logger(CharacterSafetyService.name);

  constructor(
    private prisma: PrismaService,
    private moderation: ModerationService,
    private safetyEscalation: SafetyEscalationService,
  ) {}

  /**
   * Evaluate the safety of a character interaction turn.
   *
   * Runs the existing ModerationService.moderateContent() against the
   * learner's input, and (if provided) separately against the character's
   * proposed AI response - both directions are checked independently,
   * since a benign input can still produce an unsafe AI response and vice
   * versa. Also runs the deterministic parent-bypass pattern check on
   * both texts. The final state is the most restrictive of everything
   * evaluated.
   */
  async evaluateSafety(
    characterId: string,
    learnerId: string,
    input: string,
    aiResponse?: string,
  ): Promise<SafetyEvaluation> {
    const reasons: string[] = [];
    const states: SafetyState[] = [];

    // --- Learner input direction ---
    const inputModeration = await this.moderation.moderateContent(input, 'TEXT', learnerId);
    const inputState = this.mapModerationToState(inputModeration);
    if (inputState !== 'safe') {
      states.push(inputState);
      reasons.push(`input: ${inputModeration.explanation} (severity=${inputModeration.severity})`);
    }

    if (this.detectsParentBypass(input)) {
      states.push('parent_approval_required');
      reasons.push('input: matched parental-oversight-bypass pattern');
    }

    // --- AI response direction (only if a candidate response was generated) ---
    let responseModeration: ModerationResult | undefined;
    if (aiResponse && aiResponse.trim().length > 0) {
      responseModeration = await this.moderation.moderateContent(aiResponse, 'TEXT', learnerId);
      const responseState = this.mapModerationToState(responseModeration);
      if (responseState !== 'safe') {
        states.push(responseState);
        reasons.push(
          `response: ${responseModeration.explanation} (severity=${responseModeration.severity})`,
        );
      }

      if (this.detectsParentBypass(aiResponse)) {
        states.push('parent_approval_required');
        reasons.push('response: matched parental-oversight-bypass pattern');
      }
    }

    const state = this.resolveMostRestrictive(states);
    const allowResponse = state === 'safe' || state === 'restricted';

    await this.logSafetyEvent(characterId, learnerId, state, reasons, {
      inputModeration,
      responseModeration,
    });

    if (state === 'escalation_required') {
      // This is the fix for a real safety gap: previously
      // 'escalation_required' was resolved above and only ever written
      // into ModerationLog's free-form fields - nothing created an
      // actionable record, so a HIGH-severity character-safety event on
      // a children's platform had nowhere real to escalate to. Create a
      // persisted SafetyEscalation here so a moderator/admin can see,
      // claim, and resolve it via the /safety-escalations endpoints.
      // Never let a failure here break the caller's fallback-response
      // path for the child - log and continue.
      try {
        await this.safetyEscalation.createEscalation({
          learnerId,
          triggerReason: reasons.join('; ') || 'escalation_required (no reasons captured)',
          safetyState: state,
        });
      } catch (error: any) {
        this.logger.error(
          `Failed to create SafetyEscalation record for learner ${learnerId}, character ${characterId}: ${error?.message}`,
        );
      }
    }

    return { state, reasons, allowResponse };
  }

  /**
   * Simple, deterministic, rule-based check for emotional-dependency risk
   * across a conversation history. Not a new ML model - just pattern
   * matching for concerning phrases plus a session-length/frequency
   * heuristic, per the "do not rely only on LLM prompt" requirement.
   *
   * conversationHistory entries are expected to loosely look like
   * { role: 'learner' | 'character', content: string, createdAt?: string|Date }
   * but this is intentionally defensive about shape since it may be fed
   * raw DB rows or in-memory message objects.
   */
  checkEmotionalDependencyRisk(conversationHistory: any[]): boolean {
    if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return false;
    }

    let dependencyPhraseHits = 0;
    const timestamps: Date[] = [];

    for (const entry of conversationHistory) {
      const text: string =
        typeof entry === 'string'
          ? entry
          : entry?.content ?? entry?.message ?? entry?.request ?? entry?.response ?? '';

      if (typeof text === 'string' && text.length > 0) {
        for (const pattern of DEPENDENCY_PHRASES) {
          if (pattern.test(text)) {
            dependencyPhraseHits++;
            break; // count once per message, not once per pattern
          }
        }
      }

      const ts = entry?.createdAt ?? entry?.timestamp;
      if (ts) {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          timestamps.push(d);
        }
      }
    }

    // Repeated dependency-signaling language across the conversation
    // (a single mention could be innocuous phrasing; 2+ is a pattern).
    if (dependencyPhraseHits >= 2) {
      return true;
    }

    // Excessive session length / message frequency as a secondary signal.
    if (conversationHistory.length > MAX_HEALTHY_MESSAGES_PER_SESSION) {
      return true;
    }

    if (timestamps.length >= 2) {
      timestamps.sort((a, b) => a.getTime() - b.getTime());
      const spanMinutes =
        (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / 60000;
      if (spanMinutes > MAX_HEALTHY_SESSION_MINUTES) {
        return true;
      }
    }

    return dependencyPhraseHits >= 1 && conversationHistory.length > MAX_HEALTHY_MESSAGES_PER_SESSION / 2;
  }

  /**
   * Map the generic ModerationService verdict onto the 5-state model.
   */
  private mapModerationToState(result: ModerationResult): SafetyState {
    if (result.severity === 'CRITICAL' && result.shouldBlock) {
      return 'blocked';
    }
    if (result.severity === 'HIGH') {
      return 'escalation_required';
    }
    if (result.severity === 'MEDIUM') {
      return 'restricted';
    }
    // LOW / not flagged
    return 'safe';
  }

  /**
   * Deterministic keyword/pattern check for parental-oversight-bypass
   * signals. Kept separate from moderateContent() since it's a distinct
   * category the generic moderator isn't tuned to flag.
   */
  private detectsParentBypass(text: string): boolean {
    if (!text) return false;
    return PARENT_BYPASS_PATTERNS.some((pattern) => pattern.test(text));
  }

  /**
   * Priority order (most restrictive wins) when multiple states are
   * triggered across input/response/pattern checks.
   */
  private resolveMostRestrictive(states: SafetyState[]): SafetyState {
    const priority: SafetyState[] = [
      'blocked',
      'parent_approval_required',
      'escalation_required',
      'restricted',
      'safe',
    ];
    for (const candidate of priority) {
      if (states.includes(candidate)) {
        return candidate;
      }
    }
    return 'safe';
  }

  /**
   * Persist a safety event to the general ModerationLog audit trail
   * (moderation_logs) - the 5-state character-safety verdict and both
   * moderation results are carried in the existing free-form fields
   * (categories/severity/action) plus a JSON-encoded detail blob
   * appended to contentPreview, since ModerationLog has no dedicated
   * metadata Json column to extend.
   *
   * NOTE: this is the audit log only. For 'escalation_required' states,
   * a *separate*, actionable SafetyEscalation record is also created
   * (see the call site in evaluateSafety()) - ModerationLog alone is
   * not queryable/actionable enough for a moderator to work a queue
   * against, which was the original gap this fixes.
   */
  private async logSafetyEvent(
    characterId: string,
    learnerId: string,
    state: SafetyState,
    reasons: string[],
    details: { inputModeration: ModerationResult; responseModeration?: ModerationResult },
  ): Promise<void> {
    try {
      const worstSeverity =
        details.responseModeration &&
        this.severityRank(details.responseModeration.severity) >
          this.severityRank(details.inputModeration.severity)
          ? details.responseModeration.severity
          : details.inputModeration.severity;

      await this.prisma.moderationLog.create({
        data: {
          contentType: 'CHARACTER_INTERACTION',
          contentPreview: JSON.stringify({
            characterId,
            learnerId,
            state,
            reasons,
          }).substring(0, 500),
          flagged: state !== 'safe',
          categories: [`CHARACTER_SAFETY_STATE:${state}`, ...reasons.map((r) => r.split(':')[0])],
          severity: worstSeverity,
          action: state === 'blocked' || state === 'escalation_required' ? 'BLOCKED' : 'ALLOWED',
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to log character safety event: ${error?.message}`);
    }
  }

  private severityRank(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): number {
    const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    return order[severity] ?? 0;
  }
}
