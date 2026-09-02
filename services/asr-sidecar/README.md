# ASR Sidecar (faster-whisper)

Minimal FastAPI service wrapping [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
(MIT license) for speech-to-text. Part of Voice Pipeline v1
(see `docs/architecture/USAM_OSS_INTEGRATION_PLAN.md` Section 3).

## API

`POST /transcribe` — multipart form field `file` (any audio file ffmpeg can
decode: wav, webm, mp3, m4a, etc). Returns:

```json
{ "text": "...", "language": "en", "language_probability": 0.98 }
```

`GET /health` — liveness/readiness probe.

## Build & run (bound to localhost only — never public)

```bash
docker build -t usam-asr-sidecar .
docker run -d --name usam-asr-sidecar --restart unless-stopped \
  -p 127.0.0.1:8100:8100 \
  usam-asr-sidecar
```

## Verify

```bash
curl -s -X POST http://127.0.0.1:8100/transcribe -F "file=@test.wav"
```

Model size defaults to `base` (good CPU speed/accuracy balance); set
`WHISPER_MODEL_SIZE=tiny` for a faster/lower-accuracy option.
