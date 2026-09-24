export const runtime="nodejs";
export const maxDuration=60;
export async function POST(req){
 try{
  const form=await req.formData(), image=form.get("image"), video=form.get("video"), mode=form.get("mode")==="replace"?"replace":"animate";
  if(!(image instanceof File)||!(video instanceof File))return Response.json({error:"Brakuje zdjęcia lub filmu."},{status:400});
  if(image.size>10*1024*1024)return Response.json({error:"Zdjęcie jest za duże (maks. 10 MB)."},{status:413});
  if(video.size>100*1024*1024)return Response.json({error:"Film jest za duży dla tej wersji webowej (maks. 100 MB)."},{status:413});
  if(!process.env.WAN_WORKER_URL)return Response.json({ok:true,prepared:true,message:"Interfejs FREE jest gotowy. Aby faktycznie uruchomić Wan2.2-Animate, podłącz worker GPU przez WAN_WORKER_URL. Sam Vercel nie uruchomi modelu 14B."});
  const fd=new FormData();fd.append("image",image);fd.append("video",video);fd.append("mode",mode);
  const r=await fetch(process.env.WAN_WORKER_URL.replace(/\/$/,"")+"/generate",{method:"POST",headers:process.env.WAN_WORKER_TOKEN?{"Authorization":`Bearer ${process.env.WAN_WORKER_TOKEN}`}:{},body:fd});
  const d=await r.json().catch(()=>({}));if(!r.ok)return Response.json({error:d.error||`Worker HTTP ${r.status}`},{status:502});
  return Response.json(d);
 }catch(e){return Response.json({error:e?.message||"Błąd serwera."},{status:500})}
}