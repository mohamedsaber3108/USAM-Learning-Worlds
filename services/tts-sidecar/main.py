"""
TTS sidecar — minimal FastAPI wrapper around Piper (MIT license,
github.com/rhasspy/piper) for text-to-speech.

Bound to 127.0.0.1 only. Called internally by
backend/src/modules/voice/voice.service.ts.

Uses the `piper-tts` PyPI package's `PiperVoice` API directly (avoids
shelling out to the piper CLI binary). Voice model files are downloaded at
image build time from rhasspy/piper-voices (Hugging Face) — see
download_voice.py / Dockerfile.
"""
import io
import os
import wave

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from piper import PiperVoice

VOICE_MODEL_PATH = os.environ.get("PIPER_MODEL_PATH", "/app/voices/en_US-lessac-medium.onnx")
VOICE_CONFIG_PATH = os.environ.get("PIPER_CONFIG_PATH", VOICE_MODEL_PATH + ".json")

app = FastAPI(title="USAM TTS Sidecar", version="1.0.0")

_voice: PiperVoice | None = None


def get_voice() -> PiperVoice:
    global _voice
    if _voice is None:
        _voice = PiperVoice.load(VOICE_MODEL_PATH, config_path=VOICE_CONFIG_PATH)
    return _voice


@app.on_event("startup")
def _load_voice_on_startup() -> None:
    get_voice()


class SynthesizeRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok", "voice_model": os.path.basename(VOICE_MODEL_PATH)}


@app.post("/synthesize")
def synthesize(req: SynthesizeRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")
    if len(text) > 2000:
        raise HTTPException(status_code=400, detail="text too long (max 2000 chars)")

    try:
        voice = get_voice()
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wav_file:
            voice.synthesize(text, wav_file)
        wav_bytes = buf.getvalue()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {exc}") from exc

    return Response(content=wav_bytes, media_type="audio/wav")
