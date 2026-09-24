# Viral Video AI — PRO

Production-oriented Next.js app using Runway Dev and Seedance 2.5 for reference-driven video generation.

## What it does
- Upload a character/person image.
- Provide a direct HTTPS reference-video URL.
- Seedance 2.5 video-to-video uses the video as motion/composition guidance and the image as a character reference.
- Polls generation status and displays the finished video.
- API credentials remain server-side.

## Deploy on Vercel
1. Import this GitHub repository.
2. In **Project → Settings → Environment Variables**, add `RUNWAYML_API_SECRET`.
3. Create the key in the Runway developer portal.
4. Redeploy.

## Input notes
The image is sent as a data URI and is limited to 5 MB by the UI. The reference video must be a direct public HTTPS MP4/MOV/WebM URL. Seedance 2.5 reference/input video should be at least 480p.

## Security
Never commit your Runway API key. `.env` and `.env.local` are ignored by Git.
