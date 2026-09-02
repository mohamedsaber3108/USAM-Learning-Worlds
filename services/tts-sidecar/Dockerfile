FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download a small, permissively-licensed English voice from
# rhasspy/piper-voices (Hugging Face). en_US-lessac-medium is MIT-licensed
# per the piper-voices repo (verify per-voice license again before
# production ship, per the integration plan's license-registry note).
RUN mkdir -p /app/voices && \
    curl -fsSL -o /app/voices/en_US-lessac-medium.onnx \
      https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx && \
    curl -fsSL -o /app/voices/en_US-lessac-medium.onnx.json \
      https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

COPY main.py .

ENV PIPER_MODEL_PATH=/app/voices/en_US-lessac-medium.onnx
ENV PIPER_CONFIG_PATH=/app/voices/en_US-lessac-medium.onnx.json

EXPOSE 8200

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8200"]
