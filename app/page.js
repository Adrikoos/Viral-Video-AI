"use client";
import {useEffect,useState} from "react";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export default function Home(){
 const [image,setImage]=useState(null),[video,setVideo]=useState(null),[audio,setAudio]=useState(null),[mode,setMode]=useState("animate"),[audioMode,setAudioMode]=useState("source"),[message,setMessage]=useState(""),[result,setResult]=useState(""),[api,setApi]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/health").then(r=>r.json()).then(setApi).catch(()=>setApi({ok:false}))},[]);
 async function submit(e){e.preventDefault();setMessage("");setResult("");
  if(!image||!video)return setMessage("Dodaj zdjęcie postaci i film referencyjny.");
  if(audioMode==="upload"&&!audio)return setMessage("Dodaj plik audio.");
  setBusy(true);setMessage("Wysyłam materiały do generatora…");
  try{
   const fd=new FormData();fd.append("image",image);fd.append("video",video);fd.append("mode",mode);fd.append("audioMode",audioMode);if(audio)fd.append("audio",audio);
   const r=await fetch("/api/generate",{method:"POST",body:fd});const d=await r.json();if(!r.ok)throw new Error(d.error||"Błąd generowania.");
   if(d.videoUrl){setResult(d.videoUrl);setMessage("Gotowe.");setBusy(false);return}
   if(!d.jobId){setMessage(d.message||"Materiały przygotowane.");setBusy(false);return}
   setMessage("Generuję film…");
   for(let i=0;i<180;i++){await sleep(5000);const s=await fetch("/api/status?id="+encodeURIComponent(d.jobId),{cache:"no-store"});const x=await s.json();if(!s.ok)throw new Error(x.error||"Błąd statusu.");if(x.status==="SUCCEEDED"||x.status==="completed"){setResult(x.videoUrl||x.output);setMessage("Gotowe — film z dźwiękiem został wygenerowany.");setBusy(false);return}if(x.status==="FAILED"||x.status==="failed")throw new Error(x.error||"Generowanie nie powiodło się.");}
   throw new Error("Generowanie nadal trwa.");
  }catch(err){setMessage(err.message||"Błąd.");setBusy(false)}
 }
 return <main className="shell"><header><div className="brand">VIRAL <span>VIDEO AI</span></div><div className={"pill "+(api?.configured?"on":"")}>{api?.configured?"WAN READY":"FREE / LOCAL"}</div></header>
 <section className="hero"><div className="eyebrow">WAN2.2 · CHARACTER + MOTION + AUDIO</div><h1>Twoja postać.<br/><em>Ruch i dźwięk z virala.</em></h1><p>Dodaj zdjęcie, film referencyjny i wybierz sposób obsługi dźwięku. Wynikiem jest gotowy MP4.</p></section>
 <form onSubmit={submit} className="grid">
 <div className="card"><span className="step">01</span><h2>Postać</h2><label className="upload"><input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)}/><b>{image?image.name:"Wybierz zdjęcie"}</b><small>JPG / PNG / WEBP</small></label></div>
 <div className="card"><span className="step">02</span><h2>Film referencyjny</h2><label className="upload"><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setVideo(e.target.files?.[0]||null)}/><b>{video?video.name:"Wybierz film"}</b><small>MP4 / MOV / WEBM</small></label></div>
 <div className="card wide"><span className="step">03</span><h2>Generowanie</h2><div className="controls">
 <div><label>Ruch postaci</label><select value={mode} onChange={e=>setMode(e.target.value)}><option value="animate">Animation — naśladuj ruch</option><option value="replace">Replacement — zamień postać</option></select></div>
 <div><label>Dźwięk</label><select value={audioMode} onChange={e=>setAudioMode(e.target.value)}><option value="source">Zachowaj audio z filmu</option><option value="upload">Własny MP3/WAV</option><option value="none">Bez dźwięku</option><option value="s2v">AI Speech-to-Video (S2V)</option></select></div>
 <div><label>Silnik</label><input className="field" value={audioMode==="s2v"?"Wan2.2-S2V-14B":"Wan2.2-Animate-14B"} disabled/></div></div>
 {(audioMode==="upload"||audioMode==="s2v")&&<><label>Audio</label><label className="upload"><input type="file" accept="audio/mpeg,audio/wav,audio/x-wav" onChange={e=>setAudio(e.target.files?.[0]||null)}/><b>{audio?audio.name:"Wybierz MP3/WAV"}</b><small>{audioMode==="s2v"?"Mowa/śpiew sterują synchronizacją":"Zastąpi ścieżkę dźwiękową filmu"}</small></label></>}
 <button disabled={busy}>{busy?"GENEROWANIE…":"GENERUJ GOTOWY FILM →"}</button>{message&&<div className="notice">{message}</div>}{result&&<video className="result" controls src={result}/>}</div></form>
 <footer>Viral Video AI · Wan2.2 Animate / S2V · audio muxing po stronie workera</footer></main>
}