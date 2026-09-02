# TTS Sidecar (Piper)

Minimal FastAPI service wrapping [Piper](https://github.com/rhasspy/piper)
(MIT license) for text-to-speech. Part of Voice Pipeline v1
(see `docs/architecture/USAM_OSS_INTEGRATION_PLAN.md` Section 3).

## API

`POST /synthesize` — JSON body `{ "text": "..." }` (max 2000 chars).
Returns raw `audio/wav` bytes.

`GET /health` — liveness/readiness probe.

## Build & run (bound to localhost only — never public)

```bash
docker build -t usam-tts-sidecar .
docker run -d --name usam-tts-sidecar --restart unless-stopped \
  -p 127.0.0.1:8200:8200 \
  usam-tts-sidecar
```

## Verify

```bash
curl -s -X POST http://127.0.0.1:8200/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from Piper"}' \
  -o out.wav
file out.wav   # should report: WAVE audio
```

Voice model: `en_US-lessac-medium` from `rhasspy/piper-voices` (verify the
exact per-voice license again before shipping, per the integration plan's
license-registry note — most piper-voices are MIT/permissive but this is a
per-file check, not a per-library check).
