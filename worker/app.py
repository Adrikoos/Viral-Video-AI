import os, uuid, shutil, subprocess, threading
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.responses import FileResponse

app=FastAPI(title="Viral Video AI Wan Worker")
ROOT=Path(os.getenv("WAN_WORKDIR","/tmp/viral-video-ai")); ROOT.mkdir(parents=True,exist_ok=True)
TOKEN=os.getenv("WAN_WORKER_TOKEN","")
JOBS={}

def auth(authorization):
    if TOKEN and authorization != f"Bearer {TOKEN}": raise HTTPException(401,"Unauthorized")

def run(cmd):
    subprocess.run(cmd,check=True)

def process(job,image,video,audio,mode,audio_mode):
    d=ROOT/job; out=d/"wan-output.mp4"; final=d/"final.mp4"
    try:
        JOBS[job]={"status":"PROCESSING"}
        # WAN_GENERATE_COMMAND is a wrapper command you configure after installing official Wan2.2.
        # It receives: image video mode output. Example wrapper can call official preprocessing + generate.py.
        wrapper=os.getenv("WAN_GENERATE_COMMAND")
        if not wrapper: raise RuntimeError("WAN_GENERATE_COMMAND is not configured on the GPU worker.")
        run([wrapper,str(image),str(video),mode,str(out)])
        if audio_mode=="none": shutil.copy2(out,final)
        elif audio_mode=="source":
            run(["ffmpeg","-y","-i",str(out),"-i",str(video),"-map","0:v:0","-map","1:a:0?","-c:v","copy","-c:a","aac","-shortest",str(final)])
        elif audio_mode=="upload":
            run(["ffmpeg","-y","-i",str(out),"-i",str(audio),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-shortest",str(final)])
        else:
            raise RuntimeError("S2V requires the dedicated Wan2.2-S2V wrapper; configure it before using this mode.")
        JOBS[job]={"status":"SUCCEEDED","videoUrl":f"/result/{job}"}
    except Exception as e: JOBS[job]={"status":"FAILED","error":str(e)}

@app.get("/health")
def health(): return {"ok":True,"wan_command":bool(os.getenv("WAN_GENERATE_COMMAND"))}

@app.post("/generate")
async def generate(image:UploadFile=File(...),video:UploadFile=File(...),mode:str=Form("animate"),audioMode:str=Form("source"),audio:UploadFile|None=File(None),authorization:str|None=Header(None)):
    auth(authorization); job=uuid.uuid4().hex; d=ROOT/job; d.mkdir()
    ip=d/("image"+Path(image.filename or ".png").suffix); vp=d/("video"+Path(video.filename or ".mp4").suffix)
    with ip.open("wb") as f: shutil.copyfileobj(image.file,f)
    with vp.open("wb") as f: shutil.copyfileobj(video.file,f)
    ap=None
    if audio:
        ap=d/("audio"+Path(audio.filename or ".mp3").suffix)
        with ap.open("wb") as f: shutil.copyfileobj(audio.file,f)
    JOBS[job]={"status":"QUEUED"}
    threading.Thread(target=process,args=(job,ip,vp,ap,mode,audioMode),daemon=True).start()
    return {"jobId":job,"status":"QUEUED"}

@app.get("/status/{job}")
def status(job:str,authorization:str|None=Header(None)):
    auth(authorization); return JOBS.get(job,{"status":"FAILED","error":"Unknown job"})

@app.get("/result/{job}")
def result(job:str,authorization:str|None=Header(None)):
    auth(authorization); p=ROOT/job/"final.mp4"
    if not p.exists(): raise HTTPException(404,"Not ready")
    return FileResponse(p,media_type="video/mp4",filename="viral-video.mp4")
