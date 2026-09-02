/**
 * Grammar Check Service
 *
 * Deterministic rule-based grammar/spelling checker backed by a
 * self-hosted LanguageTool instance (internal-only sidecar,
 * 127.0.0.1:8010 on the Kids-server — never exposed publicly).
 *
 * LanguageTool is run as a separate process over HTTP (LGPL-2.1,
 * "aggregation not linking" per docs/architecture/USAM_OSS_INTEGRATION_PLAN.md
 * Section 2), so this service imposes no licensing obligation on USAM's
 * own NestJS code.
 *
 * This complements (does not replace) the LLM-based holistic feedback in
 * `ai/services/english-coach.service.ts` — LanguageTool catches mechanical
 * errors (spelling, subject-verb agreement, punctuation) cheaply and
 * deterministically; the LLM still handles style/clarity/pedagogy.
 */

import { Injectable, Logger } from '@nestjs/common';

export interface GrammarIssue {
  ruleId: string;
  message: string;
  shortMessage?: string;
  offset: number;
  length: number;
  replacements: string[];
  category: string;
  issueType: string;
  context: string;
}

export interface GrammarCheckResult {
  issues: GrammarIssue[];
  detectedLanguage?: string;
  raw?: unknown;
}

const LANGUAGETOOL_URL =
  process.env.LANGUAGETOOL_URL || 'http://127.0.0.1:8010';
const REQUEST_TIMEOUT_MS = 8000;

@Injectable()
export class GrammarCheckService {
  private readonly logger = new Logger(GrammarCheckService.name);

  /**
   * Run text through the self-hosted LanguageTool `/v2/check` endpoint and
   * return a normalized, deterministic GrammarIssue[] DTO.
   *
   * Fails soft: on any network/parse error, returns an empty issue list
   * (with `raw` set to the error) rather than throwing, so a LanguageTool
   * outage never blocks the existing LLM-based coaching flow.
   */
  async checkGrammar(
    text: string,
    language: string = 'en-US',
  ): Promise<GrammarCheckResult> {
    if (!text || !text.trim()) {
      return { issues: [] };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const params = new URLSearchParams({
        text,
        language,
      });

      const response = await fetch(`${LANGUAGETOOL_URL}/v2/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `LanguageTool returned HTTP ${response.status}`,
        );
      }

      const data = await response.json();
      const matches: any[] = Array.isArray(data?.matches) ? data.matches : [];

      const issues: GrammarIssue[] = matches.map((m) => ({
        ruleId: m?.rule?.id ?? 'UNKNOWN_RULE',
        message: m?.message ?? '',
        shortMessage: m?.shortMessage || undefined,
        offset: m?.offset ?? 0,
        length: m?.length ?? 0,
        replacements: Array.isArray(m?.replacements)
          ? m.replacements.map((r: any) => r?.value).filter(Boolean)
          : [],
        category: m?.rule?.category?.id ?? 'OTHER',
        issueType: m?.rule?.issueType ?? 'other',
        context: m?.context?.text ?? '',
      }));

      return {
        issues,
        detectedLanguage: data?.language?.detectedLanguage?.code,
        raw: data,
      };
    } catch (error: any) {
      this.logger.warn(
        `LanguageTool grammar check failed, degrading gracefully: ${error?.message}`,
      );
      return { issues: [], raw: { error: error?.message } };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Quick boolean-style summary, useful for callers that just want a count.
   */
  async countIssues(text: string, language: string = 'en-US'): Promise<number> {
    const result = await this.checkGrammar(text, language);
    return result.issues.length;
  }
}
