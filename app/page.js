"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("pro");
  const [quality, setQuality] = useState("1080p");
  const [duration, setDuration] = useState("8");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [api, setApi] = useState(null);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(setApi).catch(() => setApi({ ok:false }));
  }, []);

  async function generate(e) {
    e.preventDefault();
    setMessage(""); setVideoUrl("");
    if (!image) return setMessage("Dodaj zdjęcie postaci.");
    if (!referenceUrl) return setMessage("Wklej publiczny URL do filmu referencyjnego.");
    setStatus("loading");
    try {
      const reader = new FileReader();
      const imageData = await new Promise((resolve,reject) => {
        reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(image);
      });
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ imageData, referenceUrl, prompt, model, quality, duration:Number(duration) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      if (data.videoUrl) setVideoUrl(data.videoUrl);
      setMessage(data.message || "Generowanie rozpoczęte.");
      setStatus("done");
    } catch (err) {
      setMessage(err.message || "Nie udało się połączyć z API.");
      setStatus("error");
    }
  }

  return <main className="shell">
    <header><div className="brand">VIRAL <span>VIDEO AI</span></div><div className={"pill "+(api?.configured ? "on":"")}>{api?.configured ? "AI READY" : "SETUP REQUIRED"}</div></header>
    <section className="hero"><div className="eyebrow">PRO 3.0 · VERCEL READY</div><h1>Odtwórz ruch.<br/><em>Zachowaj swoją postać.</em></h1><p>Dodaj zdjęcie postaci, wklej bezpośredni link do filmu referencyjnego i wygeneruj własną wersję AI.</p></section>
    <form onSubmit={generate} className="grid">
      <div className="card"><span className="step">01</span><h2>Postać</h2><label className="upload"><input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)}/><b>{image ? image.name : "Wybierz zdjęcie"}</b><small>JPG, PNG, WEBP</small></label></div>
      <div className="card"><span className="step">02</span><h2>Film referencyjny</h2><label>Publiczny URL filmu</label><input className="field" type="url" placeholder="https://.../reference.mp4" value={referenceUrl} onChange={e=>setReferenceUrl(e.target.value)} required/><small className="hint">Użyj bezpośredniego, publicznego MP4/MOV/WebM. Strony TikTok, Reels i YouTube nie są bezpośrednimi plikami wideo.</small></div>
      <div className="card wide"><span className="step">03</span><h2>Ustawienia generacji</h2><div className="controls"><div><label>Model</label><select value={model} onChange={e=>setModel(e.target.value)}><option value="pro">Pro</option><option value="fast">Fast</option></select></div><div><label>Jakość</label><select value={quality} onChange={e=>setQuality(e.target.value)}><option>1080p</option><option>720p</option></select></div><div><label>Długość</label><select value={duration} onChange={e=>setDuration(e.target.value)}><option value="5">5 s</option><option value="8">8 s</option><option value="10">10 s</option></select></div></div><label>Instrukcja dodatkowa</label><textarea className="field" rows="3" placeholder="Np. zachowaj twarz, strój i fryzurę postaci..." value={prompt} onChange={e=>setPrompt(e.target.value)}/><button disabled={status==="loading"}>{status==="loading" ? "GENEROWANIE…" : "GENERUJ VIRAL VIDEO →"}</button>{message && <div className={"notice "+status}>{message}</div>}{videoUrl && <video className="result" controls src={videoUrl}/>}</div>
    </form>
    <footer>Viral Video AI · same-origin API · klucz API pozostaje po stronie serwera</footer>
  </main>;
}