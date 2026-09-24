"use client";
import {useEffect,useState} from "react";
export default function Home(){
 const [image,setImage]=useState(null),[video,setVideo]=useState(null),[mode,setMode]=useState("animate"),[message,setMessage]=useState(""),[api,setApi]=useState(null);
 useEffect(()=>{fetch("/api/health").then(r=>r.json()).then(setApi).catch(()=>setApi({ok:false}))},[]);
 async function submit(e){e.preventDefault();setMessage("");
  if(!image||!video)return setMessage("Dodaj zdjęcie postaci i film z ruchem.");
  setMessage("Przygotowuję pliki…");
  const fd=new FormData();fd.append("image",image);fd.append("video",video);fd.append("mode",mode);
  try{const r=await fetch("/api/generate",{method:"POST",body:fd});const d=await r.json();if(!r.ok)throw new Error(d.error);setMessage(d.message||"Pliki gotowe.");}catch(err){setMessage(err.message||"Błąd.");}
 }
 return <main className="shell"><header><div className="brand">VIRAL <span>VIDEO AI</span></div><div className={"pill "+(api?.configured?"on":"")}>{api?.configured?"WAN READY":"FREE / LOCAL"}</div></header>
 <section className="hero"><div className="eyebrow">WAN2.2 ANIMATE · OPEN SOURCE</div><h1>Przenieś ruch.<br/><em>Zachowaj postać.</em></h1><p>Zdjęcie postaci + film referencyjny. Wan2.2-Animate odtwarza ruch i ekspresję w trybie Animation lub Replacement.</p></section>
 <form onSubmit={submit} className="grid"><div className="card"><span className="step">01</span><h2>Postać</h2><label className="upload"><input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)}/><b>{image?image.name:"Wybierz zdjęcie"}</b><small>JPG / PNG / WEBP</small></label></div>
 <div className="card"><span className="step">02</span><h2>Film z ruchem</h2><label className="upload"><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setVideo(e.target.files?.[0]||null)}/><b>{video?video.name:"Wybierz film"}</b><small>MP4 / MOV / WEBM</small></label></div>
 <div className="card wide"><span className="step">03</span><h2>Tryb</h2><div className="controls"><div><label>Generacja</label><select value={mode} onChange={e=>setMode(e.target.value)}><option value="animate">Animation — postać naśladuje ruch</option><option value="replace">Replacement — zamiana postaci w filmie</option></select></div><div><label>Model</label><input className="field" value="Wan2.2-Animate-14B" disabled/></div><div><label>Koszt modelu</label><input className="field" value="Open-source" disabled/></div></div><button>PRZYGOTUJ GENEROWANIE →</button>{message&&<div className="notice">{message}</div>}</div></form>
 <footer>Viral Video AI · Wan2.2-Animate-14B · Apache-2.0</footer></main>
}