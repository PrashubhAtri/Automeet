from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os

config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name='gmail',
    client_id=config("GMAIL_CLIENT_ID"),
    client_secret=config("GMAIL_CLIENT_SECRET"),
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
    api_base_url='https://gmail.googleapis.com/',
    client_kwargs={
        'scope': 'https://www.googleapis.com/auth/gmail.send',
        'access_type': 'offline',
        'prompt': 'consent'
    }
)

async def gmail_login(request):
    redirect_uri = config("GMAIL_REDIRECT_URI")
    return await oauth.gmail.authorize_redirect(request, redirect_uri)

async def gmail_callback(request):
    token = await oauth.gmail.authorize_access_token(request)
    return token
