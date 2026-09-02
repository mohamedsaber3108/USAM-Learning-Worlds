import { Module } from '@nestjs/common';
import { CodingSandboxController } from './coding-sandbox.controller';
import { CodingSandboxService } from './coding-sandbox.service';
import { MasteryModule } from '../mastery/mastery.module';
import { AIModule } from '../ai/ai.module';

/**
 * Coding Sandbox v1.
 *
 * Zero backend code execution by design: this module serves mission specs,
 * validates client-executed (Pyodide/Sandpack) results, persists attempts,
 * and requests AI code-review commentary from the existing AIModule's
 * CodingCoachService. See docs/architecture/USAM_OSS_INTEGRATION_PLAN.md
 * Section 1 for the full rationale and the concrete integration sketch this
 * module implements.
 */
@Module({
  imports: [MasteryModule, AIModule],
  controllers: [CodingSandboxController],
  providers: [CodingSandboxService],
  exports: [CodingSandboxService],
})
export class CodingSandboxModule {}
