import whisper
import os

model = whisper.load_model("base")  # or "small", "medium", "large"

def transcribe_audio(file_path):
    result = model.transcribe(file_path)
    return result['text']
