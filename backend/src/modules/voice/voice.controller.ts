/**
 * Voice Controller
 *
 * POST /voice/turn — accepts multipart audio + conversationId, returns
 * { transcript, aiResponseText, audioUrl }. See voice.service.ts for the
 * full orchestration (ASR sidecar -> existing ConversationService ->
 * TTS sidecar).
 */
import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VoiceService } from './voice.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { VoiceTurnDto } from './dto/voice-turn.dto';

@Controller('voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(
    private readonly voiceService: VoiceService,
    private readonly entitlements: EntitlementsService,
  ) {}

  @Post('turn')
  @UseInterceptors(FileInterceptor('audio'))
  async turn(
    @CurrentUser() user: any,
    @UploadedFile() audio: any,
    @Body() dto: VoiceTurnDto,
  ) {
    const learnerId = user?.learner?.id;
    if (!learnerId) {
      throw new BadRequestException('Only learners can use the voice pipeline');
    }

    // Entitlement gate (G-4): voice is a paid capability (FAMILY/SCHOOL). Gate
    // on the learner's billing owner's plan `voice` flag before doing any
    // ASR/TTS work — the most expensive pipeline sits behind the highest tier.
    const ownerUserId = await this.entitlements.resolveOwnerUserIdForLearner(learnerId);
    const voiceAllowed = ownerUserId
      ? await this.entitlements.hasFeature(ownerUserId, 'voice')
      : false;
    if (!voiceAllowed) {
      throw new ForbiddenException(
        'Voice chat is available on the Family plan. Upgrade to talk with your learning companion.',
      );
    }

    if (!audio || !audio.buffer) {
      throw new BadRequestException('No audio file provided (field name must be "audio")');
    }
    if (!dto?.conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    return this.voiceService.processTurn(
      audio.buffer,
      audio.originalname,
      dto.conversationId,
      learnerId,
    );
  }
}
