"""
ASR sidecar — minimal FastAPI wrapper around faster-whisper.

Bound to 127.0.0.1 only (see Dockerfile/docker run command). Never exposed
publicly. Called internally by backend/src/modules/voice/voice.service.ts.

License note: faster-whisper is MIT (github.com/SYSTRAN/faster-whisper).
Underlying OpenAI Whisper model+code are also MIT. See
docs/architecture/USAM_OSS_INTEGRATION_PLAN.md Section 3 for the full
license verification trail.
"""
import os
import tempfile

from fastapi import FastAPI, File, UploadFile, HTTPException
from faster_whisper import WhisperModel

MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "base")
DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

app = FastAPI(title="USAM ASR Sidecar", version="1.0.0")

_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
    return _model


@app.on_event("startup")
def _load_model_on_startup() -> None:
    # Load eagerly so the first real request isn't slow, and so container
    # health checks can rely on the process being fully ready.
    get_model()


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_SIZE, "device": DEVICE}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if file is None:
        raise HTTPException(status_code=400, detail="No audio file provided")

    suffix = os.path.splitext(file.filename or "")[1] or ".wav"
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty audio file")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        model = get_model()
        segments, info = model.transcribe(tmp_path, beam_size=5)
        text = "".join(segment.text for segment in segments).strip()

        return {
            "text": text,
            "language": info.language,
            "language_probability": info.language_probability,
        }
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}") from exc
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
