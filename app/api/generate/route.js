export const runtime="nodejs";
export const maxDuration=30;
const API="https://api.dev.runwayml.com/v1";
const headers=()=>({"Content-Type":"application/json","Authorization":`Bearer ${process.env.RUNWAYML_API_SECRET}`,"X-Runway-Version":"2024-11-06"});

function validVideoUrl(value){try{const u=new URL(value);return u.protocol==="https:"&&/\.(mp4|mov|webm)(\?.*)?$/i.test(u.pathname+u.search)}catch{return false}}
function ratioFor(q){return q==="1080p"?"1080:1920":q==="480p"?"480:854":"720:1280"}

export async function POST(req){
  try{
    if(!process.env.RUNWAYML_API_SECRET) return Response.json({error:"Brakuje RUNWAYML_API_SECRET w konfiguracji Vercel."},{status:503});
    const {imageData,referenceUrl,prompt="",quality="720p"}=await req.json();
    if(!imageData||!referenceUrl) return Response.json({error:"Brakuje zdjęcia lub filmu referencyjnego."},{status:400});
    if(!validVideoUrl(referenceUrl)) return Response.json({error:"Film referencyjny musi być bezpośrednim publicznym linkiem HTTPS do MP4, MOV lub WebM."},{status:400});
    if(typeof imageData!=="string"||!imageData.startsWith("data:image/")) return Response.json({error:"Nieprawidłowy format zdjęcia."},{status:400});
    if(imageData.length>7_000_000) return Response.json({error:"Zdjęcie jest za duże. Maksymalny rozmiar to około 5 MB."},{status:413});
    const body={model:"seedance2_5",mode:"reference",promptVideo:referenceUrl,references:[{type:"image",uri:imageData}],promptText:prompt||"Preserve the identity, face, hair, clothing and appearance of the person in the reference image. Recreate the movement, timing, camera motion and composition of the reference video.",ratio:ratioFor(quality)};
    const upstream=await fetch(API+"/video_to_video",{method:"POST",headers:headers(),body:JSON.stringify(body),cache:"no-store"});
    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok) return Response.json({error:data.error||data.message||`Runway API HTTP ${upstream.status}`},{status:502});
    return Response.json({ok:true,jobId:data.id});
  }catch(e){return Response.json({error:e?.message||"Błąd serwera."},{status:500})}
}