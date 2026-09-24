export const runtime = "nodejs";
export const maxDuration = 60;

function isDirectVideoUrl(value) {
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) && /\.(mp4|mov|webm)(\?.*)?$/i.test(u.pathname + u.search);
  } catch { return false; }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { imageData, referenceUrl, prompt="", model="pro", quality="1080p", duration=8 } = body || {};
    if (!imageData || !referenceUrl) return Response.json({error:"Brakuje zdjęcia lub URL filmu referencyjnego."},{status:400});
    if (!isDirectVideoUrl(referenceUrl)) return Response.json({error:"URL musi prowadzić bezpośrednio do publicznego pliku MP4, MOV lub WebM."},{status:400});
    if (!process.env.VIDEO_API_URL || !process.env.VIDEO_API_KEY) return Response.json({error:"Generator nie jest jeszcze podłączony. Dodaj VIDEO_API_URL i VIDEO_API_KEY w Vercel → Project → Settings → Environment Variables."},{status:503});
    const upstream = await fetch(process.env.VIDEO_API_URL,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.VIDEO_API_KEY}`},body:JSON.stringify({image:imageData,reference_video_url:referenceUrl,prompt,model,quality,duration}),cache:"no-store"});
    const text = await upstream.text(); let data={}; try{data=JSON.parse(text)}catch{data={raw:text}};
    if(!upstream.ok) return Response.json({error:data.error?.message||data.error||data.message||`API generatora zwróciło HTTP ${upstream.status}`},{status:502});
    return Response.json({ok:true,message:data.message||"Zadanie zostało wysłane do generatora.",videoUrl:data.videoUrl||data.video_url||data.output?.url||null,jobId:data.jobId||data.id||data.task_id||null});
  } catch(e) { return Response.json({error:e?.message||"Błąd serwera."},{status:500}); }
}