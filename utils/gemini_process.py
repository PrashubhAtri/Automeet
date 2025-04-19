import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Set your API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def process_transcript(transcript: str):
    prompt = f"""
    You are an AI meeting assistant. Given the transcript below, summarize it in 3–5 bullet points and extract clear action items (with task, owner, and due date if possible).

    Transcript:
    \"\"\"{transcript}\"\"\"

    Format your response as JSON:
    {{
        "summary": ["..."],
        "action_items": [
            {{
                "task": "...",
                "owner": "...",
                "due_date": "..."
            }}
        ]
    }}
    """

    model = genai.GenerativeModel("models/gemini-1.5-flash-8b-exp-0827")
    response = model.generate_content(prompt)

    return response.text  # This will be a JSON-like string
    # return {"response.text"}  # This will be a JSON-like string
