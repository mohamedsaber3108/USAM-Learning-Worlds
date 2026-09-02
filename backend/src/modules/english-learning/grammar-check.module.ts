/**
 * English Learning module — currently a minimal home for the
 * deterministic grammar-check sidecar client (LanguageTool).
 *
 * Kept intentionally small: this module does not own English coaching
 * business logic (that stays in `modules/ai/services/english-coach.service.ts`);
 * it just packages the GrammarCheckService so other modules (AIModule) can
 * import and inject it without a circular dependency.
 */

import { Module } from '@nestjs/common';
import { GrammarCheckService } from './services/grammar-check.service';

@Module({
  providers: [GrammarCheckService],
  exports: [GrammarCheckService],
})
export class EnglishLearningModule {}
