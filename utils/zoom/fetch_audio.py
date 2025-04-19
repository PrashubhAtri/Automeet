import httpx
import os

SAVE_PATH = "static/uploads/zoom_audio.m4a"

async def fetch_latest_audio(access_token: str) -> str:
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    async with httpx.AsyncClient() as client:
        # 1. Get user ID
        user_resp = await client.get("https://api.zoom.us/v2/users/me", headers=headers)
        user_id = user_resp.json().get("id")

        # 2. Get recordings
        rec_resp = await client.get(f"https://api.zoom.us/v2/users/{user_id}/recordings", headers=headers)
        rec_resp.raise_for_status()
        meetings = rec_resp.json().get("meetings", [])

        if not meetings:
            raise Exception("No Zoom meetings found with recordings.")

        # 3. Find latest audio recording
        files = meetings[0].get("recording_files", [])
        audio_files = [f for f in files if f["file_type"] == "M4A"]

        if not audio_files:
            raise Exception("No audio (.m4a) files found in latest meeting.")

        download_url = audio_files[0]["download_url"]

        # 4. Download the .m4a file
        download_resp = await client.get(download_url, headers=headers)
        os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)

        with open(SAVE_PATH, "wb") as f:
            f.write(download_resp.content)

        print(f"Zoom audio saved to: {SAVE_PATH}")
        return SAVE_PATH
