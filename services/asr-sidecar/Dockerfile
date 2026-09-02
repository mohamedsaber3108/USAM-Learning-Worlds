FROM python:3.11-slim

# ffmpeg is required by faster-whisper/ctranslate2 for decoding arbitrary
# input audio containers (webm/mp3/etc), not just raw wav.
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Default to the 'base' model for a reasonable CPU speed/accuracy tradeoff.
# Override with WHISPER_MODEL_SIZE=tiny for even faster/lower-accuracy.
ENV WHISPER_MODEL_SIZE=base
ENV WHISPER_DEVICE=cpu
ENV WHISPER_COMPUTE_TYPE=int8

EXPOSE 8100

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8100"]
