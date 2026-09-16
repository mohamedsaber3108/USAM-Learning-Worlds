/**
 * Egyptian-Arabic child-speech STT benchmark harness (audit T-P1-9).
 *
 * WHAT THIS IS:
 * Runs a manifest of real audio clips (each with a human reference
 * transcript) through a registered STT provider — the SAME SttProvider
 * interface the product uses — and reports Word Error Rate (WER) per clip
 * and in aggregate. This is how we quantitatively decide whether a
 * fine-tuned Egyptian-Arabic model is worth promoting ahead of generic
 * Whisper (reference numbers: off-the-shelf Whisper EG-Arabic child speech
 * WER ~0.59; fine-tuned EG models roughly halve it).
 *
 * WHY A HARNESS AND NOT A HARD-CODED RESULT:
 * We do NOT ship a claimed accuracy number. Real WER depends on the actual
 * audio + the running provider, so this must be executed against a real
 * dataset with the ASR sidecar running. The harness is the deliverable; the
 * number is produced by whoever runs it on real data.
 *
 * MANIFEST FORMAT (JSON):
 *   {
 *     "provider": "whisper-sidecar",          // optional; defaults to first
 *     "languageHint": "ar",                    // optional
 *     "clips": [
 *       { "audioPath": "clips/001.wav", "reference": "انا بحب المدرسة" },
 *       ...
 *     ]
 *   }
 * audioPath is resolved relative to the manifest file's directory.
 *
 * HOW TO RUN:
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/benchmark-eg-arabic-stt.ts <manifest.json>
 * or:
 *   npm run voice:benchmark -- <manifest.json>
 *
 * Requires the ASR sidecar (or whichever provider you target) to be running.
 */

import { NestFactory } from '@nestjs/core';
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { AppModule } from '../src/app.module';
import {
  STT_PROVIDERS,
  SttProvider,
} from '../src/modules/voice/interfaces/voice-provider.interface';
import { wordErrorRate } from '../src/modules/voice/benchmark/wer';

interface ManifestClip {
  audioPath: string;
  reference: string;
}
interface Manifest {
  provider?: string;
  languageHint?: string;
  clips: ManifestClip[];
}

async function main() {
  const manifestArg = process.argv[2];
  if (!manifestArg) {
    console.error('Usage: benchmark-eg-arabic-stt.ts <manifest.json>');
    process.exit(1);
  }
  const manifestPath = resolve(process.cwd(), manifestArg);
  if (!existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const manifestDir = dirname(manifestPath);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const providers = app.get<SttProvider[]>(STT_PROVIDERS);
    if (!providers?.length) {
      console.error('No STT providers registered.');
      process.exit(1);
    }

    const provider = manifest.provider
      ? providers.find((p) => p.id === manifest.provider)
      : providers[0];
    if (!provider) {
      console.error(
        `Provider "${manifest.provider}" not found. Available: ${providers.map((p) => p.id).join(', ')}`,
      );
      process.exit(1);
    }

    console.log(`\n=== EG-Arabic STT Benchmark ===`);
    console.log(`Provider: ${provider.name} (${provider.id})`);
    console.log(`Clips: ${manifest.clips.length}\n`);

    let totalWords = 0;
    let totalErrors = 0;
    let scored = 0;
    let failed = 0;

    for (const clip of manifest.clips) {
      const audioFullPath = resolve(manifestDir, clip.audioPath);
      if (!existsSync(audioFullPath)) {
        console.warn(`  [skip] audio not found: ${clip.audioPath}`);
        failed++;
        continue;
      }

      const audio = readFileSync(audioFullPath);
      try {
        const result = await provider.transcribe(audio, {
          filename: clip.audioPath,
          languageHint: manifest.languageHint,
        });
        const wer = wordErrorRate(clip.reference, result.text);
        totalWords += wer.referenceWords;
        totalErrors += wer.substitutions + wer.insertions + wer.deletions;
        scored++;
        console.log(
          `  ${clip.audioPath}: WER=${wer.wer.toFixed(3)} ` +
            `(S=${wer.substitutions} I=${wer.insertions} D=${wer.deletions})`,
        );
        console.log(`      ref: ${clip.reference}`);
        console.log(`      hyp: ${result.text}`);
      } catch (err) {
        failed++;
        console.error(`  [fail] ${clip.audioPath}: ${(err as Error).message}`);
      }
    }

    const aggregateWer = totalWords > 0 ? totalErrors / totalWords : 0;
    console.log(`\n=== Results ===`);
    console.log(`Scored clips: ${scored}  Failed/skipped: ${failed}`);
    console.log(`Aggregate WER: ${aggregateWer.toFixed(4)}`);
    console.log(
      `(Reference: off-the-shelf Whisper on EG-Arabic child speech ~0.59; ` +
        `fine-tuned EG models roughly halve that.)\n`,
    );
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[benchmark] Fatal error:', err);
  process.exit(1);
});
