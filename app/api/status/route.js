export const runtime="nodejs";
export const dynamic="force-dynamic";
const API="https://api.dev.runwayml.com/v1";
export async function GET(req){
  try{
    if(!process.env.RUNWAYML_API_SECRET) return Response.json({error:"Brakuje RUNWAYML_API_SECRET."},{status:503});
    const id=new URL(req.url).searchParams.get("id");
    if(!id||!/^[a-zA-Z0-9_-]+$/.test(id)) return Response.json({error:"Nieprawidłowe ID zadania."},{status:400});
    const r=await fetch(API+"/tasks/"+encodeURIComponent(id),{headers:{"Authorization":`Bearer ${process.env.RUNWAYML_API_SECRET}`,"X-Runway-Version":"2024-11-06"},cache:"no-store"});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) return Response.json({error:d.error||d.message||`Runway API HTTP ${r.status}`},{status:502});
    return Response.json({status:d.status,videoUrl:Array.isArray(d.output)?d.output[0]||null:null,error:d.failure||d.failureCode||null});
  }catch(e){return Response.json({error:e?.message||"Błąd serwera."},{status:500})}
}