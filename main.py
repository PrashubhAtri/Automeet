import os
import shutil

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware


from utils.whisper_transcribe import transcribe_audio
from utils.gemini_process import process_transcript
from utils.zoom.zoom_auth import zoom_login, zoom_callback
from utils.zoom.fetch_audio import fetch_latest_audio
from utils.gmail.gmail_auth import gmail_login, gmail_callback

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "a3fbc4e5610979a1bb8a9e372e88c6cc4bd78553f4bfa2385f546f73a16c1423")
)

@app.get("/gmail/login")
async def login_to_gmail(request: Request):
    return await gmail_login(request)

@app.get("/gmail/callback")
async def gmail_auth_callback(request: Request):
    token = await gmail_callback(request)
    request.session["gmail_token"] = token
    return {"message": "Gmail authorized!"}


@app.get("/zoom/login")
async def login(request: Request):
    return await zoom_login(request)

@app.get("/zoom/callback")
async def auth_callback(request: Request):
    token = await zoom_callback(request)
    request.session["zoom_token"] = token["access_token"]
    return {"message": "Zoom authorization successful."}

@app.get("/zoom/process-latest")
async def process_latest_zoom_meeting(request: Request):
    access_token = request.session.get("zoom_token")
    if not access_token:
        return {"error": "Access token not found. Please authenticate via /zoom/login"}
    audio_path = await fetch_latest_audio(access_token)
    # transcript = transcribe_audio(audio_path)
    return {
        "audio_saved_as": audio_path,
        # "transcript": transcript
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "static/uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload/")
async def upload_audio(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # transcript = transcribe_audio(file_location)
    with open('./demos/AutoMeet_transcript.txt', 'r') as file:
        transcript = file.read()
    summary_json = process_transcript(transcript)

    return {
        "transcript": transcript,
        "summary": summary_json
    }
