# 11 — Voice & Speech Audit

**Baseline:** `origin/main @ 3a787c0`. Evidence from inventory + AI/English audits.

## Current state

- `backend/src/modules/voice/` (voice.controller/service + `voice-turn.dto`) exists; `services/asr-sidecar` + `services/tts-sidecar` (Python, Dockerfiles) provide STT/TTS out-of-process. `docker-compose.sidecars.yml` wires them.
- Frontend `features/voice/` (VoiceChatPage, VoiceRecorder, VoicePlayer, voiceApi) exists; UI auto-falls-back to text chat when the sidecar is unavailable.
- Interaction is **turn-based** (`POST /voice/turn`), not streaming/full-duplex.

## Findings

| ID | Requirement | Status | Evidence / gap |
|---|---|---|---|
| USAM-VOICE-001 | Provider-independent STT/TTS/realtime abstraction; state machine | **PARTIALLY_IMPLEMENTED** | sidecar abstraction + text fallback exist; state machine (idle→listening→thinking→speaking→paused→muted→error) not fully realized; turn-based only |
| USAM-VOICE-002 | Full pipeline child→VAD→STT→safety→intent→context→character→LLM→safety→TTS→streaming→interruption | **PARTIALLY_IMPLEMENTED** | transcript carried; **no VAD, no streaming, no interruption**; safety on character path only |
| USAM-VOICE-003 | Egyptian-Arabic + child-speech benchmark | **REQUIRES_RESEARCH** | no benchmark exists; child/Egyptian-Arabic STT accuracy unknown — decision-critical |
| USAM-VOICE-004 | OSS eval (Whisper/LiveKit/Pipecat/Moshi/sherpa-onnx) | **REQUIRES_RESEARCH** | see `14_OSS`: LiveKit Agents Apache-2.0 POC candidate |

## Key risks

- Pronunciation scoring is faked (hardcoded `0.85`, ENG-2) — any speaking/pronunciation feature is not real until STT + phoneme scoring land.
- Voice is not orchestrated into the character turn loop (07 weak link).
- Egyptian-Arabic child-speech performance is unproven and is the single biggest voice research dependency.
