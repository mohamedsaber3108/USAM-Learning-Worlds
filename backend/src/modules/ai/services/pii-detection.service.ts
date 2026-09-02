/**
 * PII Detection Service
 *
 * Deterministic PII detection backed by a self-hosted Microsoft Presidio
 * analyzer instance (internal-only sidecar, 127.0.0.1:5002 on the
 * Kids-server — never exposed publicly).
 *
 * Presidio is MIT-licensed and run as its own Python/spaCy service, called
 * over HTTP — see docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 4.
 * It is a complement to (not a replacement for) the existing Bedrock
 * LLM-based moderation check in `moderation.service.ts`: Presidio gives a
 * deterministic, high-confidence backstop for PII (names, phone numbers,
 * emails, addresses) that the LLM might miss on a given call.
 */

import { Injectable, Logger } from '@nestjs/common';

export interface PiiEntity {
  entityType: string;
  start: number;
  end: number;
  score: number;
}

const PRESIDIO_URL = process.env.PRESIDIO_URL || 'http://127.0.0.1:5002';
const REQUEST_TIMEOUT_MS = 8000;

@Injectable()
export class PiiDetectionService {
  private readonly logger = new Logger(PiiDetectionService.name);

  /**
   * Run text through the self-hosted Presidio `/analyze` endpoint.
   *
   * Fails soft: on any network/parse error, returns an empty array (never
   * throws), so a Presidio outage never blocks moderation — the existing
   * Bedrock LLM check remains the primary safety net if this sidecar is
   * down.
   */
  async detectPii(text: string, language: string = 'en'): Promise<PiiEntity[]> {
    if (!text || !text.trim()) {
      return [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${PRESIDIO_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Presidio returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((entry: any) => ({
        entityType: entry?.entity_type ?? 'UNKNOWN',
        start: entry?.start ?? 0,
        end: entry?.end ?? 0,
        score: entry?.score ?? 0,
      }));
    } catch (error: any) {
      this.logger.warn(
        `Presidio PII detection failed, degrading gracefully: ${error?.message}`,
      );
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Convenience helper: does this text contain any detected PII above a
   * minimal confidence threshold?
   */
  async hasPii(text: string, minScore: number = 0.3): Promise<boolean> {
    const hits = await this.detectPii(text);
    return hits.some((h) => h.score >= minScore);
  }
}
