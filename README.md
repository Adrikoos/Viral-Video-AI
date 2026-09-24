# Viral Video AI — FREE / Wan2.2 Animate

The app now targets **Wan-AI/Wan2.2-Animate-14B**, an Apache-2.0 open-source character animation/replacement model.

## Modes
- **Animation** — a character from the reference image mimics the motion and expressions in the input video.
- **Replacement** — replaces the character in the source video.

## Important: “free” means self-hosted
The model weights/code are free, but a 14B video model still needs substantial GPU compute. Vercel hosts the Next.js UI/API proxy only; it cannot run the model itself.

The official Wan workflow preprocesses the uploaded image/video and then runs `generate.py --task animate-14B`. Model files are very large, so do not commit weights to this repository.

## Worker contract
Set `WAN_WORKER_URL` to a GPU service exposing:
- `POST /generate` — multipart fields: `image`, `video`, `mode`
- `GET /status/{id}`

Optional bearer authentication: `WAN_WORKER_TOKEN`.

## Model
Official model: `Wan-AI/Wan2.2-Animate-14B` on Hugging Face.
