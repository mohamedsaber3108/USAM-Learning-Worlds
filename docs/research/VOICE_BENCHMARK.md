# USAM Kids — Voice Benchmark Plan & Registry

> Reference Bible §13. Egyptian-Arabic **child** speech is the hard bar; adult
> English benchmarks do not represent it. This registry defines the benchmark
> harness + dimensions and records results. Concrete model selection is
> **POC-gated** and partly **⛔ blocked** on real USAM audio + Bedrock/model access.

Date: 2026-09-23

---

## Current state (verified)
- Voice is **turn-based**: `POST /voice/turn` → ASR sidecar → `ConversationService` (Bedrock) → TTS sidecar. Sidecars: `services/asr-sidecar`, `services/tts-sidecar`.
- STT/TTS are behind a **provider abstraction** (adapters swappable). Off-the-shelf Whisper-large-v3 EG-Arabic WER ≈ 0.59; fine-tuned EG models (e.g. `MAdel121/whisper-small-egyptian-arabic`, `datahiveai/whisper-large-v3-ar-dialects`) roughly halve it (from `docs/audit/20`).

## Benchmark dimensions (test each separately — Bible §13)
Egyptian-Arabic child speech · MSA · English child speech · Arabic-English code-switching ·
noisy room · cheap microphone · mobile device · latency · interruption/barge-in ·
accuracy (WER) · cost · privacy.

## STT candidates to benchmark
Whisper / faster-whisper / whisper.cpp · sherpa-onnx · Vosk · fine-tuned EG-Arabic Whisper variants.

## TTS candidates
Piper (verify successor repo) · Coqui/XTTS (verify license) · Kokoro (verify terms) · eSpeak NG (fallback).

## Realtime transport (later)
Turn-based today. Full-duplex (LiveKit / Pipecat / raw WebRTC / Moshi) is `RESEARCH_MORE` — do not adopt until the turn-based quality/latency is benchmarked.

## Harness
Ship the benchmark harness + adapters; **the owner runs it against real USAM child audio** (privacy: audio must not leave approved infrastructure). Record WER/latency/cost per dimension in the table below.

| Model | Dimension | WER | Latency | Cost | Notes | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| _pending real run_ | EG-Arabic child | — | — | — | — | POC |

## Blockers
- ⛔ Real child audio dataset (privacy-controlled) + Bedrock/model access needed to fill results.
- Decision (which STT/TTS to ship) deferred until the harness runs — documented, not faked.
