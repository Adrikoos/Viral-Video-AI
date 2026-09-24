"use client";
import { useEffect, useState } from "react";

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default function Home() {
  const [image,setImage]=useState(null), [referenceUrl,setReferenceUrl]=useState(""), [prompt,setPrompt]=useState("");
  const [quality,setQuality]=useState("720p"), [status,setStatus]=useState("idle"), [message,setMessage]=useState("");
  const [videoUrl,setVideoUrl]=useState(""), [api,setApi]=useState(null);

  useEffect(()=>{ fetch("/api/health").then(r=>r.json()).then(setApi).catch(()=>setApi({ok:false})); },[]);

  async function generate(e){
    e.preventDefault(); setMessage(""); setVideoUrl("");
    if(!image) return setMessage("Dodaj zdjęcie postaci.");
    if(!referenceUrl) return setMessage("Wklej bezpośredni publiczny URL do filmu referencyjnego.");
    if(image.size>5*1024*1024) return setMessage("Zdjęcie może mieć maksymalnie 5 MB.");
    setStatus("loading");
    try{
      const imageData=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(image)});
      const start=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageData,referenceUrl,prompt,quality})});
      const job=await start.json(); if(!start.ok) throw new Error(job.error||"Nie udało się uruchomić generowania.");
      setMessage("Film jest generowany. Możesz pozostawić tę kartę otwartą.");
      for(let i=0;i<120;i++){
        await sleep(5000);
        const res=await fetch("/api/status?id="+encodeURIComponent(job.jobId),{cache:"no-store"});
        const data=await res.json(); if(!res.ok) throw new Error(data.error||"Błąd sprawdzania statusu.");
        if(data.status==="SUCCEEDED"){
          setVideoUrl(data.videoUrl); setMessage("Gotowe — film został wygenerowany."); setStatus("done"); return;
        }
        if(data.status==="FAILED"||data.status==="CANCELLED") throw new Error(data.error||"Generowanie nie powiodło się.");
      }
      throw new Error("Generowanie trwa dłużej niż oczekiwano. Spróbuj ponownie za chwilę.");
    }catch(err){setStatus("error");setMessage(err.message||"Wystąpił błąd.");}
  }

  return <main className="shell">
    <header><div className="brand">VIRAL <span>VIDEO AI</span></div><div className={"pill "+(api?.configured?"on":"")}>{api?.configured?"RUNWAY READY":"SETUP REQUIRED"}</div></header>
    <section className="hero"><div className="eyebrow">PRO · SEEDANCE 2.5</div><h1>Odtwórz ruch.<br/><em>Zachowaj swoją postać.</em></h1><p>Zdjęcie definiuje postać, a film referencyjny prowadzi ruch i dynamikę ujęcia.</p></section>
    <form onSubmit={generate} className="grid">
      <div className="card"><span className="step">01</span><h2>Postać</h2><label className="upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files?.[0]||null)}/><b>{image?image.name:"Wybierz zdjęcie"}</b><small>JPG, PNG, WEBP · maks. 5 MB</small></label></div>
      <div className="card"><span className="step">02</span><h2>Ruch referencyjny</h2><label>Bezpośredni URL filmu</label><input className="field" type="url" placeholder="https://.../reference.mp4" value={referenceUrl} onChange={e=>setReferenceUrl(e.target.value)} required/><small className="hint">HTTPS, publiczny plik MP4/MOV/WebM. Film powinien mieć co najmniej 480p.</small></div>
      <div className="card wide"><span className="step">03</span><h2>Generowanie</h2><div className="controls"><div><label>Silnik</label><input className="field" value="Seedance 2.5" disabled/></div><div><label>Jakość</label><select value={quality} onChange={e=>setQuality(e.target.value)}><option value="480p">480p · szybciej/taniej</option><option value="720p">720p · rekomendowane</option><option value="1080p">1080p · premium</option></select></div><div><label>Tryb</label><input className="field" value="Reference video" disabled/></div></div><label>Instrukcja dodatkowa</label><textarea className="field" rows="3" placeholder="Np. zachowaj twarz, fryzurę i strój postaci; odtwórz ruch i kadrowanie filmu referencyjnego." value={prompt} onChange={e=>setPrompt(e.target.value)}/><button disabled={status==="loading"}>{status==="loading"?"GENEROWANIE…":"GENERUJ VIRAL VIDEO →"}</button>{message&&<div className={"notice "+status}>{message}</div>}{videoUrl&&<video className="result" controls src={videoUrl}/>}</div>
    </form><footer>Viral Video AI · Runway API · klucz API pozostaje wyłącznie po stronie serwera</footer>
  </main>;
}