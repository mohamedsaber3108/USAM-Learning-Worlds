# 24 — VOICE SYSTEM

> Voice is a CORE cross-platform capability (locked). The backend voice module is
> ALREADY provider-independent — this doc documents it and defines the frontend
> integration + the EG-Arabic benchmark gate.

Date: 2026-09-30

---

## 1. Verified backend reality (provider-independent — already built)

`backend/src/modules/voice/`:
- `voice-provider.interface.ts` — the provider abstraction (like payment).
- `whisper-sidecar.stt-provider.ts` — STT via Whisper sidecar.
- `piper-sidecar.tts-provider.ts` — TTS via Piper sidecar.
- `wer.ts` + `wer.spec.ts` — Word Error Rate scoring (the pronunciation/accuracy
  metric; EG-Arabic benchmark lever).
- `voice.service.ts`, `voice-turn.dto.ts`, `POST /voice/turn` endpoint.

So the Gate-2 "POC provider-independent voice" decision is ALREADY IMPLEMENTED
(Whisper STT + Piper TTS sidecars behind an interface). My earlier "voice
missing" was wrong.

## 2. Voice capabilities (what it must support — locked §6)

Azouz conversations · English speaking & pronunciation (WER-scored) · roleplay ·
mission guidance · oral responses · listening · accessibility (read-aloud) ·
character interaction. Woven across surfaces (mic affordance), not a silo.

## 3. Frontend integration (the gap)

Root `src/` has a voice surface but is mock-backed. Rebuild wires:
- Mic capture → `POST /voice/turn` (STT) → character/coach response → TTS
  playback. Record/playback/retry UX. Captions ALWAYS available (a11y + the
  character voice config already specifies `captionsAlwaysAvailable`).
- Age: voice-FIRST for 8–9 (`voiceFirst: true`), supportive 10–11, optional
  12–14 (from age-presentation).

## 4. Entitlement gating (10)

Voice is FAMILY-plan + minute-capped (`voice` flag + `voiceMinutesPerLearnerPer
Month` via `getLimit`) — the margin lever (48 §2). Usage meter enforced
server-side (the one meter still to build — 10 §6). Graceful fallback to
text/captions when voice is off or capped.

## 5. EG-Arabic benchmark (gating metric)

EG-Arabic child-speech accuracy is the hard benchmark (`wer.ts` measures it).
Pronunciation/speaking activities score via WER. Provider choice (Whisper/Piper
sidecars vs cloud) is swappable behind the interface; the EG-Arabic WER is the
decision metric — verify on real child speech before claiming speaking is "done".

## 6. Safety

Voice content runs through the same moderation path as text; characters' voice
obeys the same guardrails (23 §3). No voice data retained beyond policy
(retention policy exists — `20260903_add_prompt_templates_and_retention_policy`).

## 7. Honest status

Backend voice architecture: IMPLEMENTED (provider-independent). Frontend wiring:
MOCK/NEW. EG-Arabic accuracy on real child speech: UNVERIFIED (needs live test).
Speaking/pronunciation activities depend on this + new English activity types (13).
