"""
Shared helper functions used across the application.
"""
import os
import random
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone
from bson import ObjectId


def utcnow() -> datetime:
    """Return the current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)


def serialize_doc(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-safe dict.

    - Converts ObjectId fields to strings.
    - Converts datetime fields to ISO-8601 strings.
    """
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [
                serialize_doc(v) if isinstance(v, dict) else
                str(v) if isinstance(v, ObjectId) else
                v.isoformat() if isinstance(v, datetime) else v
                for v in value
            ]
        else:
            result[key] = value
    return result


def serialize_many(docs) -> list:
    """Serialize a list/cursor of MongoDB documents."""
    return [serialize_doc(d) for d in docs]


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the given length."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Send an email using SMTP settings from environment variables.

    Supports two modes:
    - Port 465 → SMTP_SSL (direct TLS, preferred for Gmail)
    - Port 587  → STARTTLS (common alternative)

    If SMTP is not configured, the OTP is printed to the console so
    development flows continue to work without an email server.
    """
    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("EMAIL_FROM", username or "no-reply@example.com")
    port = int(os.getenv("SMTP_PORT", "587"))

    if not host or not username or not password \
            or "your_gmail" in (username or "") \
            or "your_16_char" in (password or ""):
        print("\n[DEV EMAIL] ------------------------------")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(body)
        print("NOTE: Configure SMTP_HOST / SMTP_USERNAME / SMTP_PASSWORD in backend/.env to send real emails.")
        print("-----------------------------------------\n")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(body)

    try:
        if port == 465:
            # Direct SSL connection (Gmail App Password on port 465)
            with smtplib.SMTP_SSL(host, port) as server:
                server.login(username, password)
                server.send_message(msg)
        else:
            # STARTTLS (Gmail App Password on port 587)
            with smtplib.SMTP(host, port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(username, password)
                server.send_message(msg)
        print(f"[EMAIL] OTP sent successfully to {to_email}")
    except Exception as exc:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {exc}")

