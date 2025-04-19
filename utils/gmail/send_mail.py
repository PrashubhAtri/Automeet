from googleapiclient.discovery import build
from email.mime.text import MIMEText
import base64

def send_oauth_email(gmail_token, to, subject, html_body):
    creds = gmail_token
    service = build("gmail", "v1", credentials=creds)

    message = MIMEText(html_body, "html")
    message["to"] = to
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    send_message = service.users().messages().send(userId="me", body={"raw": raw}).execute()
    return send_message
