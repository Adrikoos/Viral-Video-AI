# Viral Video AI — PRO 3.0

Vercel-ready Next.js application for creating an AI video from a character image and a reference-video URL.

## Current status
The web application, UI and same-origin server API are implemented. To perform real video generation, connect a supported AI video provider in Vercel with server-side environment variables.

## Vercel deployment
Import this GitHub repository into Vercel. In Project → Settings → Environment Variables add:
- `VIDEO_API_URL`
- `VIDEO_API_KEY`

Then redeploy.

## Local development
1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Add your provider endpoint and API key
4. Run `npm run dev`
5. Open `http://localhost:3000`

## Reference videos
The current adapter accepts direct public `.mp4`, `.mov` and `.webm` URLs. TikTok, Instagram Reels and YouTube page URLs are not direct media files.

## Architecture
The browser calls only `/api/health` and `/api/generate`. Provider credentials remain server-side. The provider-specific integration is isolated in `app/api/generate/route.js`.

Never commit real API keys to GitHub.
