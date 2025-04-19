from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from fastapi import Request

config = Config('.env')
oauth = OAuth(config)

oauth.register(
    name='zoom',
    client_id=config("ZOOM_CLIENT_ID"),
    client_secret=config("ZOOM_CLIENT_SECRET"),
    access_token_url='https://zoom.us/oauth/token',
    access_token_params=None,
    authorize_url='https://zoom.us/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.zoom.us/v2/',
)

async def zoom_login(request: Request):
    # redirect_uri = request.url_for('auth_callback')
    redirect_uri = "http://localhost:8000/zoom/callback"
    return await oauth.zoom.authorize_redirect(request, redirect_uri)

async def zoom_callback(request: Request):
    token = await oauth.zoom.authorize_access_token(request)
    return token  # Save this in session or DB
