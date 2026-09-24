# GPU Worker

This folder provides the HTTP layer expected by the Vercel app.

## What is already implemented
- POST /generate upload handling and job queue
- GET /status/{id}
- GET /result/{id}
- optional bearer token
- FFmpeg audio mux: source audio / uploaded audio / silent output
- Docker CUDA base

## What still needs GPU setup
Wan2.2-Animate-14B is too large for Vercel/ordinary CPU hosting. On the GPU machine install the official Wan2.2 repository and model weights, then create an executable wrapper and set:

WAN_GENERATE_COMMAND=/opt/wan/run-animate.sh
WAN_WORKER_TOKEN=choose-a-long-secret

The wrapper receives four arguments:
1. image path
2. reference video path
3. mode: animate or replace
4. output mp4 path

It should run the official Wan2.2 Animate preprocessing/inference and place the final silent MP4 at argument 4.

S2V is intentionally not faked: its UI exists, but the worker returns a clear error until the dedicated Wan2.2-S2V wrapper is installed.

## Start
docker build -t viral-wan-worker -f worker/Dockerfile .
docker run --gpus all -p 8000:8000 -e WAN_GENERATE_COMMAND=/opt/wan/run-animate.sh -e WAN_WORKER_TOKEN=YOUR_SECRET viral-wan-worker

Then expose the worker over HTTPS and set the same URL/token in Vercel as WAN_WORKER_URL and WAN_WORKER_TOKEN.
