import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MasteryService } from '../mastery.service';

@Processor('mastery')
export class MasteryProcessor {
  constructor(private masteryService: MasteryService) {}

  @Process('recalculate')
  async handleRecalculate(job: Job) {
    const { masteryId, learnerId, competencyId } = job.data;

    console.log(`📊 Recalculating mastery for learner ${learnerId}, competency ${competencyId}`);

    try {
      const result = await this.masteryService.recalculateMastery(masteryId);

      console.log(`✅ Mastery updated: ${result.state} (confidence: ${result.confidence.toFixed(2)})`);

      return result;
    } catch (error) {
      console.error(`❌ Mastery recalculation failed:`, error.message);
      throw error;
    }
  }
}
