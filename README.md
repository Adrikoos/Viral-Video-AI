# Viral Video AI — Wan2.2 + Audio

The app is configured around open-source Wan2.2 models.

## Video modes
- **Animation** — character from the uploaded image follows motion/expression from the reference video.
- **Replacement** — replaces the source character.

## Audio modes
- **Source audio** — worker keeps/extracts audio from the reference video and muxes it into the generated MP4.
- **Uploaded audio** — MP3/WAV replaces the source soundtrack.
- **No audio** — silent result.
- **AI Speech-to-Video** — routes the job to Wan2.2-S2V-14B so speech/audio can drive the character.

## Worker
The Vercel app is the frontend/API proxy. Heavy inference must run on a GPU worker.

Environment:
```
WAN_WORKER_URL=http://your-worker:8000
WAN_WORKER_TOKEN=optional-secret
```

Worker contract:
- `POST /generate`: multipart `image`, `video`, `mode`, `audioMode`, optional `audio`
- `GET /status/{id}`
- successful status response should include `videoUrl` or `output`

For `source` and `upload`, the worker should mux audio into the generated MP4 with FFmpeg after Wan Animate finishes. For `s2v`, the worker should run Wan2.2-S2V-14B.

The Wan model code/weights are open source, but GPU compute is still required and may have infrastructure cost.
