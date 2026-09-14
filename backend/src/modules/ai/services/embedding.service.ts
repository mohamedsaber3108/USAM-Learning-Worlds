import { Injectable, Logger } from '@nestjs/common';

/**
 * EmbeddingService (audit T-P2-2)
 *
 * Produces 384-dimension sentence embeddings using the local, fully-offline
 * `@xenova/transformers` port of `sentence-transformers/all-MiniLM-L6-v2`
 * (Apache-2.0). No API key, no network at inference time once the model is
 * cached, no per-call cost — chosen over hosted embedding APIs specifically
 * because this is a children's product and we don't want learner questions
 * leaving our infrastructure just to be embedded.
 *
 * Design principles:
 *  - LAZY: the ~90MB model is only loaded on first real use, never at boot,
 *    so app startup and unrelated requests pay nothing.
 *  - OPTIONAL / FAIL-SOFT: if the model can't be loaded (offline first-run,
 *    missing native dep, etc.) every method returns null and the caller
 *    (LearnerContextService) transparently falls back to full-text search.
 *    Embeddings are an enhancement, never a hard dependency of retrieval.
 *  - NORMALIZED: vectors are L2-normalized (pooling: 'mean', normalize: true)
 *    so cosine distance in pgvector is directly meaningful.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  static readonly DIMENSIONS = 384;
  private static readonly MODEL = 'Xenova/all-MiniLM-L6-v2';

  // The transformers.js feature-extraction pipeline, loaded once.
  private extractor: any | null = null;
  private loadPromise: Promise<any | null> | null = null;
  private loadFailed = false;

  /** Whether embeddings are currently usable (model not known-broken). */
  get isEnabled(): boolean {
    return !this.loadFailed;
  }

  /**
   * Lazily load (and memoize) the embedding pipeline. Returns null if the
   * model can't be loaded — callers must treat null as "no embeddings, use
   * fallback".
   */
  private async getExtractor(): Promise<any | null> {
    if (this.extractor) return this.extractor;
    if (this.loadFailed) return null;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        // Dynamic import: keeps the heavy ESM dep out of the module graph
        // at boot and lets us fail soft if it can't be resolved/loaded.
        const mod: any = await (eval('import("@xenova/transformers")') as Promise<any>);
        const { pipeline, env } = mod;
        // Allow reading cached model files from disk; don't require network.
        if (env) {
          env.allowLocalModels = true;
        }
        const extractor = await pipeline('feature-extraction', EmbeddingService.MODEL);
        this.extractor = extractor;
        this.logger.log(`Embedding model loaded: ${EmbeddingService.MODEL}`);
        return extractor;
      } catch (err) {
        this.loadFailed = true;
        this.logger.warn(
          `Embedding model unavailable — semantic retrieval disabled, ` +
            `falling back to full-text search. Reason: ${(err as Error).message}`,
        );
        return null;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Embed a single piece of text into a 384-dim L2-normalized vector.
   * Returns null if the model is unavailable or the text is empty.
   */
  async embed(text: string): Promise<number[] | null> {
    const clean = (text || '').trim();
    if (!clean) return null;

    const extractor = await this.getExtractor();
    if (!extractor) return null;

    try {
      const output = await extractor(clean, { pooling: 'mean', normalize: true });
      // transformers.js returns a Tensor with a Float32Array `.data`.
      const vector = Array.from(output.data as Float32Array);
      if (vector.length !== EmbeddingService.DIMENSIONS) {
        this.logger.warn(
          `Unexpected embedding dimension ${vector.length} (expected ${EmbeddingService.DIMENSIONS})`,
        );
        return null;
      }
      return vector;
    } catch (err) {
      this.logger.error(`Embedding failed: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Format a JS number[] as a pgvector literal string, e.g. "[0.1,0.2,...]".
   * pgvector accepts this text form for both inserts and `<=>` queries.
   */
  toSqlVector(vector: number[]): string {
    return `[${vector.join(',')}]`;
  }

  /**
   * Build the text that represents a concept for embedding: its name plus
   * description. Kept here (not in the backfill script) so the SAME text
   * shape is used everywhere a concept is embedded, avoiding query/document
   * embedding drift.
   */
  conceptEmbeddingText(name: string, description?: string | null): string {
    return [name, description].filter(Boolean).join('. ').trim();
  }
}
